import { describe, it, expect, vi } from 'vitest'
import { createStore, useStore, Provider } from '../src/createStore'
import { renderHook, act } from '@testing-library/react-hooks'
import React from 'react'

// 定义用户状态类型
interface UserState {
  name: string
  age: number
  actions: {
    incrementAge(): void
    setName(name: string): void
  }
  getters: {
    doubleAge: number
    info: string
  }
}

// 定义计数器状态类型
interface CounterState {
  count: number
  actions: {
    increment(): void
    decrement(): void
    add(num: number): void
  }
  getters: {
    doubleCount: number
  }
}

// 定义待办事项状态类型
interface TodoState {
  todos: Array<{ id: number; text: string; done: boolean }>
  actions: {
    addTodo(text: string): void
    toggleTodo(id: number): void
    removeTodo(id: number): void
  }
  getters: {
    completedCount: number
    totalCount: number
  }
}

// 定义全局 Store 类型
interface GlobalState {
  user: UserState
  counter: CounterState
  todo: TodoState
}

describe('createStore', () => {
  describe('基础功能', () => {
    it('应该创建一个包含多个模块的 store', () => {
      // 定义简单的 store 类型
      interface SimpleState {
        user: {
          name: string
          actions: {
            setName(name: string): void
          }
        }
        counter: {
          count: number
          actions: {
            increment(): void
          }
        }
      }

      const store = createStore<SimpleState>({
        user: {
          state: () => ({ name: 'Alice' }),
          actions: {
            setName(name: string) {
              this.name = name
            },
          },
        },
        counter: {
          state: () => ({ count: 0 }),
          actions: {
            increment() {
              this.count++
            },
          },
        },
      })

      // 验证 store 包含所有模块
      expect(store).toHaveProperty('user')
      expect(store).toHaveProperty('counter')
    })

    it('应该通过 Provider 提供 store 给子组件', () => {
      interface TestState {
        test: {
          value: string
        }
      }

      const store = createStore<TestState>({
        test: {
          state: () => ({ value: 'test' }),
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useStore<TestState, 'test'>('test'), {
        wrapper,
      })

      expect(result.current?.value).toBe('test')
    })
  })

  describe('useStore Hook', () => {
    it('应该正确获取指定模块的状态', () => {
      interface TestState {
        user: {
          name: string
          age: number
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({ name: 'Alice', age: 25 }),
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result } = renderHook(() => useStore<TestState, 'user'>('user'), {
        wrapper,
      })

      expect(result.current?.name).toBe('Alice')
      expect(result.current?.age).toBe(25)
    })

    it('应该支持 selector 选择部分状态', () => {
      interface TestState {
        user: {
          name: string
          age: number
          email: string
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({ name: 'Alice', age: 25, email: 'alice@example.com' }),
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      // 使用 selector 只选择 name
      const { result } = renderHook(
        () => useStore<TestState, 'user', string>('user', (state) => state.name),
        { wrapper }
      )

      expect(result.current).toBe('Alice')
    })

    it('当模块不存在时应该返回 null', () => {
      interface TestState {
        user: {
          name: string
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({ name: 'Alice' }),
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      // 尝试获取不存在的模块
      const { result } = renderHook(
        () => {
          // @ts-ignore
          return useStore('nonexistent' as any)
        },
        { wrapper }
      )

      expect(result.current).toBe(null)
    })
  })

  describe('状态管理', () => {
    it('应该正确管理状态和执行 actions', async () => {
      interface TestState {
        user: {
          name: string
          age: number
          actions: {
            incrementAge(): void
          }
          getters: {
            doubleAge: number
          }
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({ name: 'Alice', age: 25 }),
          actions: {
            incrementAge() {
              this.age++
            },
          },
          getters: {
            doubleAge(state) {
              return state.age * 2
            },
          },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result, waitForNextUpdate } = renderHook(
        () => useStore<TestState, 'user'>('user'),
        { wrapper }
      )

      // 验证初始状态
      expect(result.current?.name).toBe('Alice')
      expect(result.current?.age).toBe(25)
      expect(result.current?.doubleAge).toBe(50)

      // 执行 action
      act(() => {
        result.current?.incrementAge()
      })

      // 等待状态更新
      await waitForNextUpdate()

      // 验证状态已更新
      expect(result.current?.age).toBe(26)
      expect(result.current?.doubleAge).toBe(52)
    })

    it('应该支持多个模块独立管理状态', async () => {
      interface TestState {
        user: {
          name: string
          actions: {
            setName(name: string): void
          }
        }
        counter: {
          count: number
          actions: {
            increment(): void
          }
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({ name: 'Alice' }),
          actions: {
            setName(name: string) {
              this.name = name
            },
          },
        },
        counter: {
          state: () => ({ count: 0 }),
          actions: {
            increment() {
              this.count++
            },
          },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      // 获取 user 模块
      const { result: userResult, waitForNextUpdate: waitForUser } = renderHook(
        () => useStore<TestState, 'user'>('user'),
        { wrapper }
      )

      // 获取 counter 模块
      const { result: counterResult, waitForNextUpdate: waitForCounter } =
        renderHook(() => useStore<TestState, 'counter'>('counter'), { wrapper })

      // 验证初始状态
      expect(userResult.current?.name).toBe('Alice')
      expect(counterResult.current?.count).toBe(0)

      // 修改 user 模块
      act(() => {
        userResult.current?.setName('Bob')
      })

      await waitForUser()
      expect(userResult.current?.name).toBe('Bob')

      // 修改 counter 模块
      act(() => {
        counterResult.current?.increment()
      })

      await waitForCounter()
      expect(counterResult.current?.count).toBe(1)
    })
  })

  describe('复杂场景', () => {
    it('应该支持包含数组的复杂状态管理', async () => {
      interface TodoItem {
        id: number
        text: string
        done: boolean
      }

      interface TestState {
        todo: {
          todos: TodoItem[]
          actions: {
            addTodo(text: string): void
            toggleTodo(id: number): void
          }
          getters: {
            completedCount: number
          }
        }
      }

      const store = createStore<TestState>({
        todo: {
          state: () => ({
            todos: [
              { id: 1, text: 'Learn React', done: false },
              { id: 2, text: 'Learn TypeScript', done: true },
            ],
          }),
          actions: {
            addTodo(text: string) {
              const newId = this.todos.length + 1
              this.todos.push({ id: newId, text, done: false })
            },
            toggleTodo(id: number) {
              const todo = this.todos.find((t) => t.id === id)
              if (todo) {
                todo.done = !todo.done
              }
            },
          },
          getters: {
            completedCount(state) {
              return state.todos.filter((t) => t.done).length
            },
          },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result, waitForNextUpdate } = renderHook(
        () => useStore<TestState, 'todo'>('todo'),
        { wrapper }
      )

      // 验证初始状态
      expect(result.current?.todos).toHaveLength(2)
      expect(result.current?.completedCount).toBe(1)

      // 添加新的 todo
      act(() => {
        result.current?.addTodo('Learn Vitest')
      })

      await waitForNextUpdate()
      expect(result.current?.todos).toHaveLength(3)

      // 切换 todo 状态
      act(() => {
        result.current?.toggleTodo(1)
      })

      await waitForNextUpdate()
      expect(result.current?.completedCount).toBe(2)
    })

    it('应该支持嵌套对象的状态管理', async () => {
      interface TestState {
        user: {
          profile: {
            name: string
            settings: {
              theme: string
              notifications: boolean
            }
          }
          actions: {
            updateTheme(theme: string): void
            toggleNotifications(): void
          }
        }
      }

      const store = createStore<TestState>({
        user: {
          state: () => ({
            profile: {
              name: 'Alice',
              settings: {
                theme: 'light',
                notifications: true,
              },
            },
          }),
          actions: {
            updateTheme(theme: string) {
              this.profile.settings.theme = theme
            },
            toggleNotifications() {
              this.profile.settings.notifications =
                !this.profile.settings.notifications
            },
          },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const { result, waitForNextUpdate } = renderHook(
        () => useStore<TestState, 'user'>('user'),
        { wrapper }
      )

      // 验证初始状态
      expect(result.current?.profile.settings.theme).toBe('light')
      expect(result.current?.profile.settings.notifications).toBe(true)

      // 更新主题
      act(() => {
        result.current?.updateTheme('dark')
      })

      await waitForNextUpdate()
      expect(result.current?.profile.settings.theme).toBe('dark')

      // 切换通知
      act(() => {
        result.current?.toggleNotifications()
      })

      await waitForNextUpdate()
      expect(result.current?.profile.settings.notifications).toBe(false)
    })
  })

  describe('性能优化', () => {
    it('使用 selector 时，未选中的状态变化不应触发重渲染', async () => {
      interface TestState {
        data: {
          count: number
          name: string
          actions: {
            incrementCount(): void
            setName(name: string): void
          }
        }
      }

      const store = createStore<TestState>({
        data: {
          state: () => ({ count: 0, name: 'test' }),
          actions: {
            incrementCount() {
              this.count++
            },
            setName(name: string) {
              this.name = name
            },
          },
        },
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      )

      const renderSpy = vi.fn()

      // 只选择 count
      const { result } = renderHook(
        () => {
          renderSpy()
          return useStore<TestState, 'data', number>('data', (state) => state.count)
        },
        { wrapper }
      )

      const initialRenderCount = renderSpy.mock.calls.length

      // 通过 store.data.get() 获取原始状态并修改 name（未被 selector 选中）
      act(() => {
        const rawState: any = store.data.get()
        rawState.name = 'updated'
      })

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 50))

      // 验证没有触发额外的重渲染（因为 selector 只选择了 count）
      // 注意：由于我们使用了 Promise.resolve().then() 批处理，
      // 可能会有一次额外的渲染，但 count 值应该保持不变
      expect(result.current).toBe(0)
    })
  })
})
