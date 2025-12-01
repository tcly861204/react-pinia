import { defineAsyncAction, defineAsyncAction0 } from '../src/async-action'
import { describe, it, expect, vi } from 'vitest'

describe('异步 Actions', () => {
  it('应该正确初始化状态', () => {
    const asyncAction = defineAsyncAction(async (id: number) => {
      return { id, name: 'test' }
    })

    expect(asyncAction.state.loading).toBe(false)
    expect(asyncAction.state.error).toBeNull()
    expect(asyncAction.state.data).toBeNull()
  })

  it('应该在执行时设置 loading 状态', async () => {
    const asyncAction = defineAsyncAction(async (id: number) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return { id, name: 'test' }
    })

    const promise = asyncAction.execute(1)
    expect(asyncAction.state.loading).toBe(true)
    
    await promise
    expect(asyncAction.state.loading).toBe(false)
  })

  it('应该在成功时设置 data', async () => {
    const asyncAction = defineAsyncAction(async (id: number) => {
      return { id, name: 'test' }
    })

    const result = await asyncAction.execute(1)
    
    expect(result).toEqual({ id: 1, name: 'test' })
    expect(asyncAction.state.data).toEqual({ id: 1, name: 'test' })
    expect(asyncAction.state.error).toBeNull()
  })

  it('应该在失败时设置 error', async () => {
    const error = new Error('Test error')
    const asyncAction = defineAsyncAction(async (id: number) => {
      throw error
    })

    await expect(asyncAction.execute(1)).rejects.toThrow('Test error')
    
    expect(asyncAction.state.error).toBe(error)
    expect(asyncAction.state.data).toBeNull()
    expect(asyncAction.state.loading).toBe(false)
  })

  it('应该在重新执行时清除之前的 error', async () => {
    let shouldFail = true
    const asyncAction = defineAsyncAction(async (id: number) => {
      if (shouldFail) {
        throw new Error('Test error')
      }
      return { id, name: 'test' }
    })

    // 第一次执行失败
    await expect(asyncAction.execute(1)).rejects.toThrow()
    expect(asyncAction.state.error).not.toBeNull()

    // 第二次执行成功
    shouldFail = false
    await asyncAction.execute(1)
    expect(asyncAction.state.error).toBeNull()
    expect(asyncAction.state.data).toEqual({ id: 1, name: 'test' })
  })

  it('应该支持 reset 方法', async () => {
    const asyncAction = defineAsyncAction(async (id: number) => {
      return { id, name: 'test' }
    })

    await asyncAction.execute(1)
    expect(asyncAction.state.data).not.toBeNull()

    asyncAction.reset()
    expect(asyncAction.state.loading).toBe(false)
    expect(asyncAction.state.error).toBeNull()
    expect(asyncAction.state.data).toBeNull()
  })

  it('应该支持无参数的异步 Action', async () => {
    const asyncAction = defineAsyncAction0(async () => {
      return { message: 'success' }
    })

    const result = await asyncAction.execute()
    expect(result).toEqual({ message: 'success' })
    expect(asyncAction.state.data).toEqual({ message: 'success' })
  })

  it('应该在 finally 块中设置 loading 为 false', async () => {
    const asyncAction = defineAsyncAction(async (id: number) => {
      throw new Error('Test error')
    })

    try {
      await asyncAction.execute(1)
    } catch (e) {
      // 忽略错误
    }

    expect(asyncAction.state.loading).toBe(false)
  })
})
