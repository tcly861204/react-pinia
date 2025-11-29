import { describe, it, expect, vi } from 'vitest'
import { typeOf, depsAreSame, debounce } from '../src/utils'

describe('utils', () => {
  describe('typeOf', () => {
    it('should identify types correctly', () => {
      expect(typeOf('string')).toBe('string')
      expect(typeOf(123)).toBe('number')
      expect(typeOf(true)).toBe('boolean')
      expect(typeOf({})).toBe('object')
      expect(typeOf([])).toBe('array')
      expect(typeOf(null)).toBe('null')
      expect(typeOf(undefined)).toBe('undefined')
      expect(typeOf(() => {})).toBe('function')
    })
  })

  describe('depsAreSame', () => {
    it('should return true for same dependencies', () => {
      expect(depsAreSame([1, 'a'], [1, 'a'])).toBe(true)
    })

    it('should return false for different dependencies', () => {
      expect(depsAreSame([1, 'a'], [1, 'b'])).toBe(false)
      expect(depsAreSame([1, 'a'], [2, 'a'])).toBe(false)
      expect(depsAreSame([1], [1, 2])).toBe(false)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
