import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineStore } from '../src/defineStore'
import { renderHook, act } from '@testing-library/react-hooks'

describe('defineStore', () => {
  describe('基础功能', () => {
    it('应该正确初始化状态', () => {
      const useCountStore = defineStore<{
        count: number
      }>({
        state: () => ({ count: 0 }),
      })

      const { result } = renderHook(() => useCountStore())

      expect(result.current.count).toBe(0)
    })

    it('应该支持嵌套对象状态', () => {
      const useUserStore = defineStore<{ user: { name: string; profile: { age: number; city: string } } }>({
        state: () => ({
          user: {
            name: 'Alice',
            profile: {
              age: 25,
              city: 'Beijing',
            },
          },
        }),
      })

      const { result } = renderHook(() => useUserStore())

      expect(result.current.user.name).toBe('Alice')
      expect(result.current.user.profile.age).toBe(25)
      expect(result.current.user.profile.city).toBe('Beijing')
    })
  })

  describe('Actions', () => {
    it('应该正确执行 actions 并更新状态', async () => {
      const useCountStore = defineStore<{ count: number, actions: { increment: () => void, add: (num: number) => void } }>({
        state: () => ({ count: 0 }),
        actions: {
          increment() {
            this.count++
          },
          add(num: number) {
            this.count += num
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() => useCountStore())

      expect(result.current.count).toBe(0)

      act(() => {
        result.current.increment()
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(1)

      act(() => {
        result.current.add(5)
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(6)
    })

    it('actions 中的 this 应该指向状态对象', async () => {
      const useStore = defineStore<{ a: number, b: number, actions: { swap: () => void } }>({
        state: () => ({ a: 1, b: 2 }),
        actions: {
          swap() {
            const temp = this.a
            this.a = this.b
            this.b = temp
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.a).toBe(1)
      expect(result.current.b).toBe(2)

      act(() => {
        result.current.swap()
      })

      await waitForNextUpdate()
      expect(result.current.a).toBe(2)
      expect(result.current.b).toBe(1)
    })

    it('应该支持异步 actions', async () => {
      const useStore = defineStore<{ data: string | null, loading: boolean, actions: { fetchData: () => Promise<void> } }>({
        state: () => ({ data: null as string | null, loading: false }),
        actions: {
          async fetchData() {
            this.loading = true
            await new Promise((resolve) => setTimeout(resolve, 10))
            this.data = 'fetched data'
            this.loading = false
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe(null)

      act(() => {
        result.current.fetchData()
      })

      await waitForNextUpdate()
      expect(result.current.loading).toBe(true)

      await waitForNextUpdate()
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('fetched data')
    })
  })

  describe('Getters', () => {
    it('应该正确计算 getters', () => {
      const useStore = defineStore<{ count: number, getters: { doubleCount: number, tripleCount: number } }>({
        state: () => ({ count: 5 }),
        getters: {
          doubleCount(state) {
            return state.count * 2
          },
          tripleCount(state) {
            return state.count * 3
          },
        },
      })

      const { result } = renderHook(() => useStore())

      expect(result.current.doubleCount).toBe(10)
      expect(result.current.tripleCount).toBe(15)
    })

    it('状态更新后 getters 应该重新计算', async () => {
      const useStore = defineStore<{ count: number, actions: { increment: () => void }, getters: { doubleCount: number } }>({
        state: () => ({ count: 5 }),
        actions: {
          increment() {
            this.count++
          },
        },
        getters: {
          doubleCount(state) {
            return state.count * 2
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.doubleCount).toBe(10)

      act(() => {
        result.current.increment()
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(6)
      expect(result.current.doubleCount).toBe(12)
    })

    it('应该支持多个 getters', () => {
      const useStore = defineStore<{ firstName: string, lastName: string, age: number, getters: { fullName: string, isAdult: boolean } }>({
        state: () => ({ firstName: 'John', lastName: 'Doe', age: 30 }),
        getters: {
          fullName(state) {
            return `${state.firstName} ${state.lastName}`
          },
          isAdult(state) {
            return state.age >= 18
          },
        },
      })

      const { result } = renderHook(() => useStore())

      expect(result.current.fullName).toBe('John Doe')
      expect(result.current.isAdult).toBe(true)
    })
  })

  describe('响应式更新', () => {
    it('直接修改状态应该触发更新', async () => {
      const useStore = defineStore<{ count: number }>({
        state: () => ({ count: 0 }),
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.count).toBe(0)

      act(() => {
        result.current.count = 10
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(10)
    })

    it('修改嵌套对象应该触发更新', async () => {
      const useStore = defineStore<{ user: { name: string, age: number } }>({
        state: () => ({
          user: {
            name: 'Alice',
            age: 25,
          },
        }),
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.user.name).toBe('Alice')

      act(() => {
        result.current.user.name = 'Bob'
      })

      await waitForNextUpdate()
      expect(result.current.user.name).toBe('Bob')
    })

    it('修改数组应该触发更新', async () => {
      const useStore = defineStore<{ items: number[] }>({
        state: () => ({ items: [1, 2, 3] }),
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.items).toEqual([1, 2, 3])

      act(() => {
        result.current.items.push(4)
      })

      await waitForNextUpdate()
      expect(result.current.items).toEqual([1, 2, 3, 4])
    })
  })

  describe('Selector', () => {
    it('应该支持 selector 选择部分状态', () => {
      const useStore = defineStore<{ count: number, name: string }>({
        state: () => ({ count: 5, name: 'test' }),
      })

      const { result } = renderHook(() => useStore((state) => state.count))

      expect(result.current).toBe(5)
    })

    it('selector 选中的状态变化时应该更新', async () => {
      const useStore = defineStore<{ count: number, actions: { increment: () => void } }>({
        state: () => ({ count: 5, name: 'test' }),
        actions: {
          increment() {
            this.count++
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() =>
        useStore((state) => state.count)
      )

      expect(result.current).toBe(5)

      act(() => {
        const store = useStore.get()
        store.count++
      })

      await waitForNextUpdate()
      expect(result.current).toBe(6)
    })

    it('selector 未选中的状态变化时不应该触发更新', async () => {
      const useStore = defineStore<{ count: number, name: string }>({
        state: () => ({ count: 5, name: 'test' }),
      })

      const renderSpy = vi.fn()
      const { result } = renderHook(() => {
        renderSpy()
        return useStore((state) => state.count)
      })

      const initialRenderCount = renderSpy.mock.calls.length

      act(() => {
        const store = useStore.get()
        store.name = 'updated'
      })

      // 等待一小段时间确保不会触发更新
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(renderSpy.mock.calls.length).toBe(initialRenderCount)
      expect(result.current).toBe(5)
    })
  })

  describe('useHooks.get()', () => {
    it('应该返回原始状态对象', () => {
      const useStore = defineStore<{ count: number }>({
        state: () => ({ count: 5 }),
      })

      const rawState = useStore.get()

      expect(rawState.count).toBe(5)
    })

    it('通过 get() 修改状态应该影响所有订阅者', async () => {
      const useStore = defineStore<{ count: number }>({
        state: () => ({ count: 5 }),
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      expect(result.current.count).toBe(5)

      act(() => {
        const rawState = useStore.get()
        rawState.count = 10
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(10)
    })
  })

  describe('边界情况', () => {
    it('应该处理空状态', () => {
      const useStore = defineStore({
        state: () => ({}),
      })

      const { result } = renderHook(() => useStore())

      expect(result.current).toEqual({})
    })

    it('应该处理只有 actions 没有 getters 的情况', async () => {
      const useStore = defineStore<{ count: number, actions: { increment: () => void } }>({
        state: () => ({ count: 0 }),
        actions: {
          increment() {
            this.count++
          },
        },
      })

      const { result, waitForNextUpdate } = renderHook(() => useStore())

      act(() => {
        result.current.increment()
      })

      await waitForNextUpdate()
      expect(result.current.count).toBe(1)
    })

    it('应该处理只有 getters 没有 actions 的情况', () => {
      const useStore = defineStore<{ count: number, getters: { doubleCount: number } }>({
        state: () => ({ count: 5 }),
        getters: {
          doubleCount(state) {
            return state.count * 2
          },
        },
      })

      const { result } = renderHook(() => useStore())

      expect(result.current.doubleCount).toBe(10)
    })
  })
})
