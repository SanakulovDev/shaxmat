import type { ReactNode } from 'react'

// Two-column layout: board on the left, text and controls on the right.
export function StepLayout({
  board,
  children,
}: {
  board?: ReactNode
  children: ReactNode
}) {
  if (!board) {
    return <div className="mx-auto max-w-xl space-y-4 text-lg">{children}</div>
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="mx-auto w-full max-w-[min(100%,calc(100dvh-18rem),34rem)]">
        {board}
      </div>
      <div className="space-y-4 text-lg">{children}</div>
    </div>
  )
}

export function Feedback({
  kind,
  children,
}: {
  kind: 'success' | 'error' | 'info'
  children: ReactNode
}) {
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
  }
  return (
    <p role="status" className={`rounded-lg border px-4 py-3 text-base ${styles[kind]}`}>
      {children}
    </p>
  )
}
