import { defineStore } from './defineStore'
import { StateOption, State } from './types'

/**
 * 测试工具返回的接口
 */
export interface TestStore<T> {
  /**
   * Store Hook，用于组件测试
   */
  useStore: ReturnType<typeof defineStore<T>>
  /**
   * 原始 Store 对象，用于直接访问状态和 Action
   */
  store: State<T> & any
  /**
   * 重置 Store 状态为初始值
   */
  reset: () => void
  /**
   * 模拟 Action 实现
   * @param name Action 名称
   * @param implementation 模拟的实现函数
   * @returns 还原函数，调用后恢复原始 Action
   */
  mockAction: (name: string, implementation: Function) => () => void
  /**
   * 获取当前状态的快照（深拷贝）
   */
  snapshot: () => any
}

/**
 * 创建一个用于测试的 Store
 * 提供了重置状态、模拟 Action 和获取快照等辅助方法
 * 
 * @param options Store 配置选项
 * @returns 测试工具对象
 */
export function createTestStore<T>(options: StateOption<T>): TestStore<T> {
  const useStore = defineStore(options)
  const store = useStore.get()

  return {
    useStore,
    store,
    
    reset() {
      const initialState = options.state()
      Object.keys(initialState).forEach(key => {
        // 直接赋值以触发响应式更新
        (store as any)[key] = (initialState as any)[key]
      })
    },

    mockAction(name: string, implementation: Function) {
      const original = (store as any)[name]
      if (typeof original !== 'function') {
        console.warn(`[react-pinia] mockAction: "${name}" is not a function or does not exist.`)
      }
      
      (store as any)[name] = implementation.bind(store)
      
      return () => {
        (store as any)[name] = original
      }
    },

    snapshot() {
      // 使用 JSON.stringify/parse 进行简单的深拷贝
      // 注意：这不处理函数、循环引用等特殊情况，但对于状态快照通常足够
      return JSON.parse(JSON.stringify(store))
    }
  }
}
