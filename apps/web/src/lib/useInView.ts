import { useEffect, useRef, useState } from 'react'

// True while the element is on screen. With `once`, stays true after the
// first time. Browsers without IntersectionObserver always get true.
export function useInView<T extends Element>({
  once = false,
  rootMargin = '0px',
}: { once?: boolean; rootMargin?: string } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false
        setInView(visible)
        if (visible && once) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView] as const
}
