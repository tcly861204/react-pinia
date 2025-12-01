import { defineStore } from '../src/defineStore'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react-hooks'

describe('持久化增强', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('应该支持 paths 过滤', async () => {
    const useStore = defineStore<{ count: number, name: string, secret: string }>({
      state: () => ({ count: 0, name: 'Alice', secret: 'hidden' }),
      persist: {
        key: 'test-paths',
        paths: ['count', 'name']
      }
    })

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.count = 1
      result.current.secret = 'exposed'
    })
    
    // 等待防抖保存
    await new Promise(resolve => setTimeout(resolve, 350))
    
    const saved = JSON.parse(localStorage.getItem('test-paths')!)
    expect(saved).toEqual({ count: 1, name: 'Alice' }) // secret 不应该被保存
    expect(saved.secret).toBeUndefined()
  })

  it('应该支持自定义序列化器', async () => {
    const serializer = {
      serialize: vi.fn((val) => JSON.stringify(val) + '_serialized'),
      deserialize: vi.fn((val) => JSON.parse(val.replace('_serialized', '')))
    }

    const useStore = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      persist: {
        key: 'test-serializer',
        serializer
      }
    })

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.count = 1
    })

    await new Promise(resolve => setTimeout(resolve, 350))

    const raw = localStorage.getItem('test-serializer')
    expect(raw).toContain('_serialized')
    expect(serializer.serialize).toHaveBeenCalled()
    
    // 测试恢复
    const useStore2 = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      persist: {
        key: 'test-serializer',
        serializer
      }
    })
    
    // 渲染 hook 以触发初始化
    const { result: result2 } = renderHook(() => useStore2())
    expect(result2.current.count).toBe(1)
    expect(serializer.deserialize).toHaveBeenCalled()
  })

  it('应该支持加密', async () => {
    const encryption = {
      encrypt: vi.fn((val) => 'encrypted_' + val),
      decrypt: vi.fn((val) => val.replace('encrypted_', ''))
    }

    const useStore = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      persist: {
        key: 'test-encryption',
        encryption
      }
    })

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.count = 1
    })

    await new Promise(resolve => setTimeout(resolve, 350))

    const raw = localStorage.getItem('test-encryption')
    expect(raw).toContain('encrypted_')
    expect(encryption.encrypt).toHaveBeenCalled()
    
    // 测试恢复
    const useStore2 = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      persist: {
        key: 'test-encryption',
        encryption
      }
    })
    
    const { result: result2 } = renderHook(() => useStore2())
    expect(result2.current.count).toBe(1)
    expect(encryption.decrypt).toHaveBeenCalled()
  })

  it('应该支持生命周期钩子', () => {
    const beforeRestore = vi.fn((state) => ({ ...state, restored: true }))
    const afterRestore = vi.fn()

    // 先保存一些数据
    localStorage.setItem('test-hooks', JSON.stringify({ count: 10 }))

    const useStore = defineStore<{ count: number, restored: boolean }>({
      state: () => ({ count: 0, restored: false }),
      persist: {
        key: 'test-hooks',
        beforeRestore,
        afterRestore
      }
    })

    // 渲染 hook 触发初始化
    const { result } = renderHook(() => useStore())
    
    expect(result.current.count).toBe(10)
    expect(result.current.restored).toBe(true) // beforeRestore 修改了状态
    expect(beforeRestore).toHaveBeenCalled()
    expect(afterRestore).toHaveBeenCalled()
  })

  it('应该支持 sessionStorage', async () => {
    const useStore = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      persist: {
        key: 'test-session',
        storage: 'sessionStorage'
      }
    })

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.count = 1
    })

    await new Promise(resolve => setTimeout(resolve, 350))

    expect(sessionStorage.getItem('test-session')).toBeTruthy()
    expect(localStorage.getItem('test-session')).toBeNull()
  })
})
