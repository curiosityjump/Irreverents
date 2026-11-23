// Images load in the background; until one is ready the caller draws its rectangle.
const images = new Map<string, HTMLImageElement>();

/** The image at assets/<path> once it has loaded, else null. */
export function image(path: string): HTMLImageElement | null {
  let img = images.get(path);
  if (!img) {
    img = new Image();
    img.src = `assets/${path}`;
    images.set(path, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}
