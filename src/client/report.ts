// Sends one line about something that went wrong to the server, through the
// reporter the page installs before this bundle (index.html, the first
// script; GET /debug/errors lists what arrived). Uncaught errors, unhandled
// rejections and failed loads are reported there by themselves; this is for
// trouble the page notices without an error being thrown.
export function report(kind: string, message: string): void {
  (window as unknown as { irreverentsReport?: (kind: string, message: string, stack?: string) => void }).irreverentsReport?.(kind, message, '');
}
