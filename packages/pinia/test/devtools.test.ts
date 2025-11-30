import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupDevTools, DevToolsInstance } from '../src/devtools'
import { StateOption } from '../src/types'

describe('DevTools Integration', () => {
  let mockDevToolsExtension: any
  let mockDevToolsInstance: any
  let originalWindow: any

  beforeEach(() => {
    // 保存原始 window 对象
    originalWindow = global.window

    // 创建 mock DevTools 实例
    mockDevToolsInstance = {
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn((callback) => {
        mockDevToolsInstance._callback = callback
        return vi.fn() // unsubscribe function
      }),
      disconnect: vi.fn(),
      _callback: null as any,
    }

    // 创建 mock DevTools 扩展
    mockDevToolsExtension = {
      connect: vi.fn(() => mockDevToolsInstance),
    }

    // 设置 window 对象
    global.window = {
      __REDUX_DEVTOOLS_EXTENSION__: mockDevToolsExtension,
    } as any
  })

  afterEach(() => {
    // 恢复原始 window 对象
    global.window = originalWindow
    vi.clearAllMocks()
  })

  describe('setupDevTools', () => {
    it('should return null when devtools is not enabled', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: false,
      }

      const result = setupDevTools(store, options)

      expect(result).toBeNull()
      expect(mockDevToolsExtension.connect).not.toHaveBeenCalled()
    })

    it('should return null when devtools option is not provided', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
      }

      const result = setupDevTools(store, options)

      expect(result).toBeNull()
    })

    it('should setup devtools when enabled with boolean true', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const result = setupDevTools(store, options)

      expect(result).not.toBeNull()
      expect(mockDevToolsExtension.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'React-Pinia Store',
          trace: false,
        })
      )
      expect(mockDevToolsInstance.init).toHaveBeenCalledWith(store)
    })

    it('should setup devtools with custom options', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: {
          enabled: true,
          name: 'My Custom Store',
          trace: true,
        },
      }

      const result = setupDevTools(store, options)

      expect(result).not.toBeNull()
      expect(mockDevToolsExtension.connect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Custom Store',
          trace: true,
        })
      )
    })

    it('should return DevToolsInstance with send method', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const result = setupDevTools(store, options)

      expect(result).toHaveProperty('send')
      expect(typeof result?.send).toBe('function')

      // 测试 send 方法
      result?.send({ type: 'TEST_ACTION' }, store)
      expect(mockDevToolsInstance.send).toHaveBeenCalledWith(
        { type: 'TEST_ACTION' },
        store
      )
    })

    it('should return DevToolsInstance with subscribe method', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const result = setupDevTools(store, options)

      expect(result).toHaveProperty('subscribe')
      expect(typeof result?.subscribe).toBe('function')

      // 测试 subscribe 方法
      const callback = vi.fn()
      result?.subscribe(callback)
      expect(mockDevToolsInstance.subscribe).toHaveBeenCalled()
    })

    it('should return DevToolsInstance with disconnect method', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const result = setupDevTools(store, options)

      expect(result).toHaveProperty('disconnect')
      expect(typeof result?.disconnect).toBe('function')
    })
  })

  describe('Time Travel Debugging', () => {
    it('should restore state on JUMP_TO_STATE', () => {
      const store = { count: 0, name: 'test' }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => ({ count: 0, name: 'test' }),
        devtools: true,
      }

      setupDevTools(store, options, onStateRestore)

      // 模拟 DevTools 发送 JUMP_TO_STATE 消息
      const newState = { count: 5, name: 'updated' }
      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'JUMP_TO_STATE' },
        state: JSON.stringify(newState),
      })

      expect(onStateRestore).toHaveBeenCalledWith(newState)
    })

    it('should restore state on JUMP_TO_ACTION', () => {
      const store = { count: 0 }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      setupDevTools(store, options, onStateRestore)

      const newState = { count: 10 }
      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'JUMP_TO_ACTION' },
        state: JSON.stringify(newState),
      })

      expect(onStateRestore).toHaveBeenCalledWith(newState)
    })

    it('should reset to initial state on RESET', () => {
      const initialState = { count: 0, name: 'initial' }
      const store = { count: 5, name: 'current' }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => initialState,
        devtools: true,
      }

      setupDevTools(store, options, onStateRestore)

      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'RESET' },
      })

      expect(onStateRestore).toHaveBeenCalledWith(initialState)
    })

    it('should commit current state on COMMIT', () => {
      const store = { count: 5 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      setupDevTools(store, options)

      // 清除之前的调用
      mockDevToolsInstance.init.mockClear()

      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'COMMIT' },
      })

      expect(mockDevToolsInstance.init).toHaveBeenCalledWith(store)
    })

    it('should rollback state on ROLLBACK', () => {
      const store = { count: 10 }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      setupDevTools(store, options, onStateRestore)

      const previousState = { count: 3 }
      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'ROLLBACK' },
        state: JSON.stringify(previousState),
      })

      expect(onStateRestore).toHaveBeenCalledWith(previousState)
    })

    it('should import state on IMPORT_STATE', () => {
      const store = { count: 0 }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      setupDevTools(store, options, onStateRestore)

      const importedState = { count: 20 }
      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: {
          type: 'IMPORT_STATE',
          nextLiftedState: {
            computedStates: [
              { state: { count: 10 } },
              { state: importedState },
            ],
          },
        },
      })

      expect(onStateRestore).toHaveBeenCalledWith(importedState)
    })

    it('should handle invalid JSON gracefully', () => {
      const store = { count: 0 }
      const onStateRestore = vi.fn()
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      setupDevTools(store, options, onStateRestore)

      mockDevToolsInstance._callback({
        type: 'DISPATCH',
        payload: { type: 'JUMP_TO_STATE' },
        state: 'invalid json',
      })

      expect(onStateRestore).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing DevTools extension gracefully', () => {
      global.window = {} as any

      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = setupDevTools(store, options)

      expect(result).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Redux DevTools Extension is not installed')
      )

      consoleWarnSpy.mockRestore()
    })

    it('should handle DevTools connection errors', () => {
      mockDevToolsExtension.connect.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = setupDevTools(store, options)

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to setup DevTools'),
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Disconnect', () => {
    it('should disconnect DevTools when disconnect is called', () => {
      const store = { count: 0 }
      const options: StateOption<any> = {
        state: () => ({ count: 0 }),
        devtools: true,
      }

      const result = setupDevTools(store, options)
      result?.disconnect?.()

      expect(mockDevToolsInstance.disconnect).toHaveBeenCalled()
    })
  })
})
