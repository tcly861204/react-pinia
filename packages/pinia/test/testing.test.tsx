import { createTestStore } from '../src/testing'
import { describe, it, expect, vi } from 'vitest'

describe('测试工具', () => {
  it('应该创建测试 store', () => {
    const { store, useStore } = createTestStore({
      state: () => ({ count: 0 })
    })

    expect(store.count).toBe(0)
    expect(typeof useStore).toBe('function')
  })

  it('应该重置状态', () => {
    const { store, reset } = createTestStore({
      state: () => ({ count: 0, name: 'Alice' })
    })

    store.count = 10
    store.name = 'Bob'
    
    expect(store.count).toBe(10)
    expect(store.name).toBe('Bob')

    reset()

    expect(store.count).toBe(0)
    expect(store.name).toBe('Alice')
  })

  it('应该模拟 action', () => {
    const { store, mockAction } = createTestStore<{ count: number }>({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        }
      }
    })

    // 模拟 action
    const mockFn = vi.fn()
    const restore = mockAction('increment', mockFn)

    store.increment()
    expect(mockFn).toHaveBeenCalled()
    expect(store.count).toBe(0) // 原始 action 未执行

    // 恢复原始 action
    restore()
    store.increment()
    expect(store.count).toBe(1)
  })

  it('应该获取快照', () => {
    const { store, snapshot } = createTestStore({
      state: () => ({ 
        user: { name: 'Alice', age: 25 },
        items: [1, 2, 3]
      })
    })

    const snap1 = snapshot()
    expect(snap1).toEqual({
      user: { name: 'Alice', age: 25 },
      items: [1, 2, 3]
    })

    // 修改状态
    store.user.name = 'Bob'
    store.items.push(4)

    const snap2 = snapshot()
    expect(snap2).toEqual({
      user: { name: 'Bob', age: 25 },
      items: [1, 2, 3, 4]
    })

    // 快照应该是深拷贝，不随状态变化而变化
    expect(snap1.user.name).toBe('Alice')
  })
})
