import { createStore } from '../src/createStore'
import { describe, it, expect } from 'vitest'

describe('嵌套模块系统', () => {
  it('应该支持基本的嵌套模块', () => {
    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          profile: {
            state: () => ({ avatar: 'avatar.png' }),
            actions: {
              updateAvatar(url: string) {
                this.avatar = url
              }
            }
          }
        }
      }
    })

    // 访问嵌套模块
    const profileStore = (store.user as any).profile._store
    expect(profileStore.avatar).toBe('avatar.png')
    
    // 调用嵌套模块的 action
    profileStore.updateAvatar('new-avatar.png')
    expect(profileStore.avatar).toBe('new-avatar.png')
  })

  it('应该支持多层嵌套（3层）', () => {
    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          settings: {
            state: () => ({ theme: 'light' }),
            modules: {
              privacy: {
                state: () => ({ public: true }),
                actions: {
                  togglePublic() {
                    this.public = !this.public
                  }
                }
              }
            }
          }
        }
      }
    })

    // 访问三层嵌套
    const privacyStore = (store.user as any).settings.privacy._store
    expect(privacyStore.public).toBe(true)
    
    privacyStore.togglePublic()
    expect(privacyStore.public).toBe(false)
  })

  it('应该支持同一层级的多个嵌套模块', () => {
    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          profile: {
            state: () => ({ avatar: '' })
          },
          settings: {
            state: () => ({ theme: 'light' })
          },
          notifications: {
            state: () => ({ count: 0 })
          }
        }
      }
    })

    // 所有嵌套模块都应该存在
    expect((store.user as any).profile).toBeDefined()
    expect((store.user as any).settings).toBeDefined()
    expect((store.user as any).notifications).toBeDefined()
    
    // 验证状态
    expect((store.user as any).profile._store.avatar).toBe('')
    expect((store.user as any).settings._store.theme).toBe('light')
    expect((store.user as any).notifications._store.count).toBe(0)
  })

  it('嵌套模块应该有独立的状态', () => {
    const store = createStore({
      user: {
        state: () => ({ count: 1 }),
        modules: {
          profile: {
            state: () => ({ count: 2 })
          }
        }
      }
    })

    const userStore = (store.user as any)._store
    const profileStore = (store.user as any).profile._store
    
    expect(userStore.count).toBe(1)
    expect(profileStore.count).toBe(2)
    
    // 修改一个不应该影响另一个
    userStore.count = 10
    expect(userStore.count).toBe(10)
    expect(profileStore.count).toBe(2)
  })

  it('嵌套模块应该支持 getters', () => {
    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          profile: {
            state: () => ({ firstName: 'Bob', lastName: 'Smith' }),
            getters: {
              fullName(state) {
                return `${state.firstName} ${state.lastName}`
              }
            }
          }
        }
      }
    })

    const profileStore = (store.user as any).profile._store
    expect(profileStore.fullName).toBe('Bob Smith')
  })

  it('嵌套模块应该继承全局插件', () => {
    const calls: string[] = []
    
    const globalPlugin = ({ store }: any) => {
      store.pluginApplied = true
      calls.push('plugin')
    }

    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          profile: {
            state: () => ({ avatar: '' })
          }
        }
      }
    }, {
      plugins: [globalPlugin]
    })

    // 全局插件应该应用到所有层级
    expect((store.user as any)._store.pluginApplied).toBe(true)
    expect((store.user as any).profile._store.pluginApplied).toBe(true)
    expect(calls.length).toBe(2) // user + profile
  })

  it('嵌套模块应该继承全局中间件', () => {
    const calls: string[] = []
    
    const globalMiddleware = () => (next: any) => (action: any) => {
      calls.push(`middleware:${action.name}`)
      return next(action)
    }

    const store = createStore<{user: {count: number}}>({
      user: {
        state: () => ({ count: 0 }),
        actions: {
          increment() {
            this.count++
          }
        },
        modules: {
          profile: {
            state: () => ({ views: 0 }),
            actions: {
              incrementViews() {
                this.views++
              }
            }
          }
        }
      }
    }, {
      middleware: [globalMiddleware]
    })

    const userStore = (store.user as any)._store
    const profileStore = (store.user as any).profile._store
    
    userStore.increment()
    profileStore.incrementViews()
    
    expect(calls).toContain('middleware:increment')
    expect(calls).toContain('middleware:incrementViews')
  })

  it('应该支持混合嵌套和非嵌套模块', () => {
    const store = createStore({
      user: {
        state: () => ({ name: 'Alice' }),
        modules: {
          profile: {
            state: () => ({ avatar: '' })
          }
        }
      },
      cart: {
        state: () => ({ items: [] })
      }
    })

    // user 有嵌套模块
    expect((store.user as any).profile).toBeDefined()
    
    // cart 没有嵌套模块
    expect((store.cart as any).profile).toBeUndefined()
    
    // 两个顶层模块都应该正常工作
    expect((store.user as any)._store.name).toBe('Alice')
    expect((store.cart as any)._store.items).toEqual([])
  })
})
