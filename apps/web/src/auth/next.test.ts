import { describe, expect, it } from 'vitest'
import { safeNext } from './next'

describe('safeNext', () => {
  it('keeps paths on this site', () => {
    expect(safeNext('/c/abcd2345')).toBe('/c/abcd2345')
    expect(safeNext('/friends/add/1?x=1')).toBe('/friends/add/1?x=1')
  })

  it('drops other sites and empty values', () => {
    expect(safeNext('//evil.example')).toBe('/')
    expect(safeNext('/\\evil.example')).toBe('/')
    expect(safeNext('https://evil.example')).toBe('/')
    expect(safeNext('javascript:alert(1)')).toBe('/')
    expect(safeNext(null)).toBe('/')
  })
})
