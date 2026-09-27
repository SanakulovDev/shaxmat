// Animations started from code. The reduced-motion rule in index.css only
// covers CSS animations, so these check the setting themselves.

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function play(
  element: Element | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  if (!element || reducedMotion() || !('animate' in element)) return
  element.animate(keyframes, options)
}

// A new page slides up into place.
export function enterPage(element: Element | null) {
  play(
    element,
    [
      { opacity: 0, transform: 'translateY(0.5rem)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 320, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
  )
}

// A short "no" shake, for a form that was turned down.
export function shake(element: Element | null) {
  play(
    element,
    [
      { transform: 'none' },
      { transform: 'translateX(-8px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(2px)' },
      { transform: 'none' },
    ],
    { duration: 420, easing: 'ease-in-out' },
  )
}
