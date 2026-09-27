import { type ReactNode, useId } from 'react'
import { useInView } from '../../lib/useInView'

// Fades its content in the first time it scrolls into view.
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, shown] = useInView<HTMLDivElement>({ once: true, rootMargin: '0px 0px -8% 0px' })
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-shown' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// A home page section with a centred heading.
export function Section({
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={`py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-board-dark">
              {eyebrow}
            </p>
          )}
          <h2 id={headingId} className="mt-2 text-3xl font-semibold sm:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-lg text-muted">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
