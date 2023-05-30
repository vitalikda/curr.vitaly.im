export function debounce<A = unknown, R = void>(fn: (args: A) => R, delay: number): (args: A) => Promise<R> {
  let timeoutId: ReturnType<typeof setTimeout>
  return (args) =>
    new Promise((resolve) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => resolve(fn(args)), delay)
    })
}
