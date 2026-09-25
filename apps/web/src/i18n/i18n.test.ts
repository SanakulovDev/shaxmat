import { describe, expect, it } from 'vitest'
import en from './en.json'
import ru from './ru.json'
import uz from './uz.json'

// Flat key list; plural forms ("moves_one", "moves_other") count as "moves".
function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? keys(child, `${prefix}${key}.`)
      : [`${prefix}${key.replace(/_(zero|one|two|few|many|other)$/, '')}`],
  )
}

describe('translations', () => {
  const uzKeys = new Set(keys(uz))

  for (const [name, strings] of Object.entries({ ru, en })) {
    it(`${name} has exactly the Uzbek keys`, () => {
      expect(new Set(keys(strings))).toEqual(uzKeys)
    })
  }
})
