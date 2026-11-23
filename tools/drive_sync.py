#!/usr/bin/env python3
"""Mirror the owner's Google Drive design library into docs/design-library/.

Run:  python3 -I tools/drive_sync.py            # import / update, then report
      python3 -I tools/drive_sync.py --check    # report what changed, write nothing

How it works (docs/mechanisms/design-library-sync.md has the full writeup):
- Crawls the shared folder through drive.google.com/embeddedfolderview
  (public, no sign-in) recursively.
- Google Docs are fetched as /mobilebasic HTML from docs.google.com and
  converted to Markdown with pandoc. (The normal /export?format=md
  redirects to a per-request *.googleusercontent.com host that the
  environment's network allowlist cannot list, so it is not used.)
- Other files are downloaded from drive.usercontent.google.com.
- docs/design-library/manifest.json records, per Drive file: its id, Drive
  path, repo path and sha256. A run compares hashes and prints what was
  added, changed and removed, so updates are checkable even without the
  owner's changelog.

Needs hosts drive.google.com, docs.google.com, drive.usercontent.google.com,
and pandoc.
"""
import hashlib, html, json, os, re, subprocess, sys, unicodedata, urllib.parse, zipfile

ROOT_FOLDER = "1UEVhtK6SA8-8AkWD4w768ZLzx1UjO8DD"
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(REPO, "docs", "design-library")
MANIFEST = os.path.join(LIB, "manifest.json")

# INTENT: superseded style studies are listed in the manifest but not
# downloaded — they are what the art is no longer meant to look like, and
# they would be ~12 MB of the repo with no use for the work. Drive keeps them.
SKIP_DOWNLOAD = ["Superseded Style Explorations"]


def curl(url, out=None):
    args = ["curl", "-sSL", "--fail", "--retry", "3"]
    if out:
        args += ["-o", out]
    r = subprocess.run(args + [url], capture_output=out is None)
    if r.returncode:
        raise RuntimeError(f"fetch failed ({r.returncode}): {url}")
    return None if out else r.stdout.decode("utf-8", "replace")


def slug(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s or "untitled"


def crawl(fid, drive_path, repo_path, out):
    page = curl(f"https://drive.google.com/embeddedfolderview?id={fid}")
    for m in re.finditer(r'<a href="([^"]+)" target="_blank">.*?flip-entry-title">([^<]+)<', page, re.S):
        url, name = html.unescape(m.group(1)), html.unescape(m.group(2)).strip()
        dp, rp = f"{drive_path}/{name}", f"{repo_path}/{slug(name)}"
        if "/folders/" in url:
            sub = url.split("/folders/")[1].split("?")[0]
            out.append({"kind": "folder", "id": sub, "drive_path": dp})
            crawl(sub, dp, rp, out)
        else:
            fid2 = url.split("/d/")[1].split("/")[0]
            if "docs.google.com/document" in url:
                kind, rp = "doc", rp + ".md"
            else:
                kind = "file"
                base, ext = os.path.splitext(name)
                rp = f"{repo_path}/{slug(base)}{ext.lower()}"
            out.append({"kind": kind, "id": fid2, "drive_path": dp, "repo_path": rp.lstrip("/")})


def unwrap(md):
    # Google wraps every link in a google.com/url?q= redirect; keep the target.
    return re.sub(r"https://www\.google\.com/url\?q=([^&)\s]+)&[^)\s]*",
                  lambda m: urllib.parse.unquote(m.group(1)), md)


def fetch_doc(e, today):
    page = curl(f"https://docs.google.com/document/d/{e['id']}/mobilebasic")
    md = subprocess.run(["pandoc", "-f", "html", "-t", "gfm-raw_html", "--wrap=none"],
                        input=page.encode(), capture_output=True, check=True).stdout.decode()
    md = unwrap(md).strip() + "\n"
    head = (f"**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive "
            f"design library: *{e['drive_path'].lstrip('/')}* "
            f"(https://docs.google.com/document/d/{e['id']}/edit). Drive is the source; "
            f"re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).\n\n---\n\n")
    return head, md


def main():
    check = "--check" in sys.argv
    today = subprocess.run(["date", "-u", "+%Y-%m-%d"], capture_output=True, text=True).stdout.strip()
    old = {}
    if os.path.exists(MANIFEST):
        old = {e["id"]: e for e in json.load(open(MANIFEST))["entries"]}
    entries = []
    crawl(ROOT_FOLDER, "", "", entries)
    tmp = os.path.join(REPO, ".drive_sync_tmp")
    os.makedirs(tmp, exist_ok=True)
    report = {"added": [], "changed": [], "unchanged": 0, "removed": [], "skipped": []}
    for e in entries:
        if e["kind"] == "folder":
            continue
        if any(s in e["drive_path"] for s in SKIP_DOWNLOAD):
            e["status"] = "not downloaded (superseded)"
            report["skipped"].append(e["drive_path"])
            continue
        dest = os.path.join(LIB, e["repo_path"])
        if e["kind"] == "doc":
            head, body = fetch_doc(e, today)
            data = body.encode()
        else:
            t = os.path.join(tmp, "f")
            try:
                curl(f"https://drive.usercontent.google.com/download?id={e['id']}&export=download&confirm=t", t)
            except RuntimeError as err:
                # INTENT: one file Drive will not hand out (a Google Sheet or
                # Slides deck has no plain download; the owner's "Master Asset
                # Production Board" is one, 2026-11-23) must not stop the
                # whole import. It is listed, not downloaded, and reported.
                e["status"] = "not downloaded (fetch failed)"
                report.setdefault("failed", []).append(f"{e['drive_path']}: {err}")
                continue
            data = open(t, "rb").read()
        e["sha256"] = hashlib.sha256(data).hexdigest()
        prev = old.get(e["id"])
        if not prev or "sha256" not in prev:
            report["added"].append(e["drive_path"])
        elif prev["sha256"] != e["sha256"]:
            report["changed"].append(e["drive_path"])
        else:
            report["unchanged"] += 1
        if not check:
            if prev and prev.get("repo_path") and prev["repo_path"] != e["repo_path"]:
                p = os.path.join(LIB, prev["repo_path"])
                subprocess.run(["rm", "-rf", p])
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            if dest.endswith(".zip"):
                # Unpacked into a folder of the same name instead of committing
                # the archive: the files become readable and diffable in the repo.
                e["repo_path"] = e["repo_path"][:-4] + "/"
                xdir = dest[:-4]
                subprocess.run(["rm", "-rf", xdir])
                with zipfile.ZipFile(__import__("io").BytesIO(data)) as z:
                    for n in z.namelist():
                        if n.endswith("/") or ".." in n or n.startswith("/"):
                            continue
                        os.makedirs(os.path.dirname(os.path.join(xdir, n)) or xdir, exist_ok=True)
                        open(os.path.join(xdir, n), "wb").write(z.read(n))
            else:
                with open(dest, "wb") as f:
                    f.write((head.encode() + data) if e["kind"] == "doc" else data)
    ids = {e["id"] for e in entries}
    for i, e in old.items():
        if i not in ids:
            report["removed"].append(e["drive_path"])
            if not check and e.get("repo_path"):
                subprocess.run(["rm", "-rf", os.path.join(LIB, e["repo_path"])])
    if not check:
        json.dump({"root_folder": f"https://drive.google.com/drive/folders/{ROOT_FOLDER}",
                   "last_sync_utc": today, "entries": entries},
                  open(MANIFEST, "w"), indent=1, ensure_ascii=False)
    subprocess.run(["rm", "-rf", tmp])
    for k in ("added", "changed", "removed", "skipped", "failed"):
        print(f"{k}: {len(report.get(k, []))}")
        for p in report.get(k, []):
            print(f"  {p}")
    print(f"unchanged: {report['unchanged']}")
    # The owner's Drive changelog (newest first): show the top of its entries.
    log = os.path.join(LIB, "changelog.md")
    if os.path.exists(log):
        txt = open(log).read()
        i = txt.find("Changes (newest first)")
        if i >= 0:
            lines = [l.lstrip("# ").rstrip() for l in txt[i:].splitlines()[1:]]
            lines = [l for l in lines if l][:12]
            print("\nTop of the Drive changelog:\n  " + "\n  ".join(lines))


if __name__ == "__main__":
    main()
