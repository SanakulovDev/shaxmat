// Where to go after signing in: a path on this site from `?next=`, or home.
// Anything else, such as "//evil.example", is ignored.
export function safeNext(next: string | null): string {
  return next && /^\/(?![/\\])/.test(next) ? next : '/'
}
