/**
 * 异步 Action 状态接口
 */
export interface AsyncActionState<T = any> {
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 数据 */
  data: T | null
}

/**
 * 异步 Action 接口
 */
export interface AsyncAction<T, R> {
  /** 异步 Action 的状态 */
  state: AsyncActionState<R>
  /** 执行异步 Action */
  execute: (payload: T) => Promise<R>
  /** 重置状态 */
  reset: () => void
}

/**
 * 定义一个异步 Action
 * 自动管理 loading、error 和 data 状态
 * 
 * @param action 异步函数
 * @returns 异步 Action 对象
 * 
 * @example
 * ```typescript
 * const useStore = defineStore({
 *   state: () => ({
 *     fetchUsers: defineAsyncAction(async () => {
 *       const response = await fetch('/api/users')
 *       return response.json()
 *     })
 *   }),
 *   actions: {
 *     async loadUsers() {
 *       return this.fetchUsers.execute()
 *     }
 *   }
 * })
 * ```
 */
export function defineAsyncAction<T, R>(
  action: (payload: T) => Promise<R>
): AsyncAction<T, R> {
  const state: AsyncActionState<R> = {
    loading: false,
    error: null,
    data: null
  }

  return {
    state,
    
    async execute(payload: T): Promise<R> {
      state.loading = true
      state.error = null
      try {
        const result = await action(payload)
        state.data = result
        return result
      } catch (error) {
        state.error = error as Error
        throw error
      } finally {
        state.loading = false
      }
    },
    
    reset() {
      state.loading = false
      state.error = null
      state.data = null
    }
  }
}

/**
 * 定义一个无参数的异步 Action
 * 
 * @param action 异步函数
 * @returns 异步 Action 对象
 */
export function defineAsyncAction0<R>(
  action: () => Promise<R>
): Omit<AsyncAction<void, R>, 'execute'> & { execute: () => Promise<R> } {
  const asyncAction = defineAsyncAction<void, R>(action as any)
  
  return {
    state: asyncAction.state,
    execute: () => asyncAction.execute(undefined as any),
    reset: asyncAction.reset
  }
}
