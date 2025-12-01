import { defineStore } from '../src/defineStore'
import { describe, it, expect, vi } from 'vitest'

describe('订阅机制', () => {
  it('应该订阅状态变化', () => {
    const mutations: any[] = []
    
    const useStore = defineStore({
      state: () => ({ count: 0, name: 'Alice' })
    })

    const store = (useStore as any)._store
    
    // 订阅状态变化
    const unsubscribe = useStore.subscribe((mutation, state) => {
      mutations.push({ ...mutation })
    })

    // 修改状态
    store.count = 1
    store.name = 'Bob'

    expect(mutations).toHaveLength(2)
    expect(mutations[0]).toMatchObject({
      type: 'mutation',
      key: 'count',
      oldValue: 0,
      newValue: 1
    })
    expect(mutations[1]).toMatchObject({
      type: 'mutation',
      key: 'name',
      oldValue: 'Alice',
      newValue: 'Bob'
    })

    unsubscribe()
  })

  it('应该订阅 action 调用', () => {
    const actions: any[] = []
    
    const useStore = defineStore<{count: number}>({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        },
        add(n: number) {
          this.count += n
        }
      }
    })

    const store = (useStore as any)._store
    
    // 订阅 action
    const unsubscribe = useStore.subscribeAction((action, state) => {
      actions.push({ name: action.name, args: action.args })
    })

    // 调用 actions
    store.increment()
    store.add(5)

    expect(actions).toHaveLength(2)
    expect(actions[0]).toMatchObject({
      name: 'increment',
      args: []
    })
    expect(actions[1]).toMatchObject({
      name: 'add',
      args: [5]
    })

    unsubscribe()
  })

  it('应该能取消订阅', () => {
    const mutations: any[] = []
    
    const useStore = defineStore({
      state: () => ({ count: 0 })
    })

    const store = (useStore as any)._store
    
    const unsubscribe = useStore.subscribe((mutation) => {
      mutations.push(mutation)
    })

    store.count = 1
    expect(mutations).toHaveLength(1)

    // 取消订阅
    unsubscribe()

    store.count = 2
    expect(mutations).toHaveLength(1) // 不应该再增加
  })

  it('应该支持多个订阅者', () => {
    const mutations1: any[] = []
    const mutations2: any[] = []
    
    const useStore = defineStore({
      state: () => ({ count: 0 })
    })

    const store = (useStore as any)._store
    
    const unsubscribe1 = useStore.subscribe((mutation) => {
      mutations1.push(mutation)
    })
    
    const unsubscribe2 = useStore.subscribe((mutation) => {
      mutations2.push(mutation)
    })

    store.count = 1

    expect(mutations1).toHaveLength(1)
    expect(mutations2).toHaveLength(1)

    unsubscribe1()
    unsubscribe2()
  })

  it('订阅者应该按顺序执行', () => {
    const order: number[] = []
    
    const useStore = defineStore({
      state: () => ({ count: 0 })
    })

    const store = (useStore as any)._store
    
    useStore.subscribe(() => {
      order.push(1)
    })
    
    useStore.subscribe(() => {
      order.push(2)
    })
    
    useStore.subscribe(() => {
      order.push(3)
    })

    store.count = 1

    expect(order).toEqual([1, 2, 3])
  })

  it('订阅回调错误不应该影响其他订阅者', () => {
    const mutations: any[] = []
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const useStore = defineStore({
      state: () => ({ count: 0 })
    })

    const store = (useStore as any)._store
    
    useStore.subscribe(() => {
      throw new Error('订阅错误')
    })
    
    useStore.subscribe((mutation) => {
      mutations.push(mutation)
    })

    store.count = 1

    expect(mutations).toHaveLength(1)
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('应该在异步 action 中触发订阅', async () => {
    const actions: any[] = []
    
    const useStore = defineStore<{data: string | null}>({
      state: () => ({ data: null as any }),
      actions: {
        async fetchData() {
          await new Promise(resolve => setTimeout(resolve, 10))
          this.data = 'loaded'
          return this.data
        }
      }
    })

    const store = (useStore as any)._store
    
    useStore.subscribeAction((action) => {
      actions.push(action.name)
    })

    await store.fetchData()

    expect(actions).toContain('fetchData')
  })

  it('状态订阅应该提供正确的状态快照', () => {
    let capturedState: any = null
    
    const useStore = defineStore({
      state: () => ({ count: 0, name: 'Alice' })
    })

    const store = (useStore as any)._store
    
    useStore.subscribe((mutation, state) => {
      capturedState = { ...state }
    })

    store.count = 5
    store.name = 'Bob'

    expect(capturedState).toMatchObject({
      count: 5,
      name: 'Bob'
    })
  })
})
