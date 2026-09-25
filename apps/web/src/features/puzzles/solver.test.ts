import { describe, expect, it } from 'vitest'
import { isCorrectMove } from './solver'

describe('isCorrectMove', () => {
  it('accepts the expected move', () => {
    expect(
      isCorrectMove({
        expected: 'h5f7',
        played: 'h5f7',
        isLastStep: false,
        givesMate: false,
      }),
    ).toBe(true)
  })

  it('accepts another mate on the last step only', () => {
    const alternativeMate = {
      expected: 'h5f7',
      played: 'd1d8',
      givesMate: true,
    }
    expect(isCorrectMove({ ...alternativeMate, isLastStep: true })).toBe(true)
    expect(isCorrectMove({ ...alternativeMate, isLastStep: false })).toBe(false)
  })

  it('rejects other moves', () => {
    expect(
      isCorrectMove({
        expected: 'h5f7',
        played: 'h5h7',
        isLastStep: true,
        givesMate: false,
      }),
    ).toBe(false)
  })
})
