// A move solves the current step when it is the expected move, or, on the
// last step, when it also gives checkmate (puzzles can have several mates).
export function isCorrectMove({
  expected,
  played,
  isLastStep,
  givesMate,
}: {
  expected: string
  played: string
  isLastStep: boolean
  givesMate: boolean
}): boolean {
  return played === expected || (isLastStep && givesMate)
}
