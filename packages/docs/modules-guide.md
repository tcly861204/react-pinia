# 模块化和命名空间指南

React-Pinia 支持嵌套模块，允许你将相关的状态逻辑组织到层次化的结构中，提高大型应用的可维护性。

## 简介

在大型应用中，将所有状态放在扁平的模块结构中可能导致：
- 模块名称冲突
- 难以找到相关功能
- 缺少逻辑分组

嵌套模块解决了这些问题，让你可以创建清晰的层次结构。

## 基本用法

### 创建嵌套模块

使用 `modules` 选项在模块内定义子模块：

```typescript
import { createStore } from 'react-pinia'

const store = createStore({
  user: {
    state: () => ({ name: 'Alice' }),
    actions: {
      setName(name: string) {
        this.name = name
      }
    },
    modules: {
      profile: {
        state: () => ({ avatar: 'default.png' }),
        actions: {
          updateAvatar(url: string) {
            this.avatar = url
          }
        }
      }
    }
  }
})
```

### 访问嵌套模块

使用点号访问嵌套模块：

```typescript
function UserProfile() {
  // 访问父模块
  const user = useStore<GlobalState, 'user'>('user')
  
  // 访问嵌套模块（通过父模块）
  const profile = (user as any).profile
  
  return (
    <div>
      <p>用户名: {user?.name}</p>
      <img src={profile?._store.avatar} />
      <button onClick={() => profile?._store.updateAvatar('new.png')}>
        更新头像
      </button>
    </div>
  )
}
```

## 多层嵌套

支持任意深度的嵌套：

```typescript
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
const privacy = (store.user as any).settings.privacy._store
privacy.togglePublic()
```

## 同级多个模块

一个模块可以包含多个子模块：

```typescript
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

// 所有子模块都可以独立访问
const profile = (store.user as any).profile._store
const settings = (store.user as any).settings._store
const notifications = (store.user as any).notifications._store
```

## 状态独立性

每个嵌套模块都有独立的状态，互不影响：

```typescript
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

userStore.count = 10
console.log(userStore.count)    // 10
console.log(profileStore.count) // 2 (不受影响)
```

## Getters 和 Actions

嵌套模块完全支持 getters 和 actions：

```typescript
const store = createStore({
  user: {
    state: () => ({ name: 'Alice' }),
    modules: {
      profile: {
        state: () => ({ 
          firstName: 'Bob', 
          lastName: 'Smith' 
        }),
        getters: {
          fullName(state) {
            return `${state.firstName} ${state.lastName}`
          }
        },
        actions: {
          updateName(first: string, last: string) {
            this.firstName = first
            this.lastName = last
          }
        }
      }
    }
  }
})

const profile = (store.user as any).profile._store
console.log(profile.fullName) // "Bob Smith"
profile.updateName('John', 'Doe')
console.log(profile.fullName) // "John Doe"
```

## 全局选项继承

嵌套模块会自动继承全局插件和中间件：

```typescript
const loggingMiddleware = () => (next: any) => (action: any) => {
  console.log('Action:', action.name)
  return next(action)
}

const store = createStore({
  user: {
    state: () => ({ name: 'Alice' }),
    actions: {
      setName(name: string) {
        this.name = name
      }
    },
    modules: {
      profile: {
        state: () => ({ avatar: '' }),
        actions: {
          updateAvatar(url: string) {
            this.avatar = url
          }
        }
      }
    }
  }
}, {
  middleware: [loggingMiddleware] // 应用到所有层级
})

// 调用任何层级的 action 都会触发中间件
const userStore = (store.user as any)._store
const profileStore = (store.user as any).profile._store

userStore.setName('Bob')           // 输出: Action: setName
profileStore.updateAvatar('new')   // 输出: Action: updateAvatar
```

## 实际应用示例

### 用户管理模块

```typescript
interface UserState {
  id: number
  name: string
}

interface ProfileState {
  avatar: string
  bio: string
}

interface SettingsState {
  theme: 'light' | 'dark'
  language: string
}

const store = createStore({
  user: {
    state: (): UserState => ({
      id: 1,
      name: 'Alice'
    }),
    actions: {
      updateName(name: string) {
        this.name = name
      }
    },
    modules: {
      profile: {
        state: (): ProfileState => ({
          avatar: 'default.png',
          bio: ''
        }),
        actions: {
          updateProfile(avatar: string, bio: string) {
            this.avatar = avatar
            this.bio = bio
          }
        }
      },
      settings: {
        state: (): SettingsState => ({
          theme: 'light',
          language: 'zh-CN'
        }),
        actions: {
          toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
          },
          setLanguage(lang: string) {
            this.language = lang
          }
        }
      }
    }
  }
})
```

### 电商应用

```typescript
const store = createStore({
  shop: {
    state: () => ({ name: 'My Shop' }),
    modules: {
      products: {
        state: () => ({ items: [] }),
        actions: {
          addProduct(product: any) {
            this.items.push(product)
          }
        }
      },
      cart: {
        state: () => ({ items: [], total: 0 }),
        actions: {
          addToCart(item: any) {
            this.items.push(item)
            this.total += item.price
          }
        },
        modules: {
          checkout: {
            state: () => ({ 
              step: 1,
              paymentMethod: null 
            }),
            actions: {
              nextStep() {
                this.step++
              },
              setPaymentMethod(method: string) {
                this.paymentMethod = method
              }
            }
          }
        }
      }
    }
  }
})
```

## 命名空间

虽然当前版本支持 `namespaced` 选项，但主要用于未来扩展。嵌套模块本身就提供了天然的命名空间隔离。

```typescript
const store = createStore({
  user: {
    namespaced: true, // 可选，为未来功能预留
    state: () => ({ name: 'Alice' }),
    modules: {
      profile: {
        // 子模块继承父模块的命名空间设置
        state: () => ({ avatar: '' })
      }
    }
  }
})
```

## 最佳实践

### 1. 合理的嵌套深度

建议不超过 3-4 层嵌套，过深的嵌套会增加复杂度：

```typescript
// ✅ 好：清晰的层次
user
  ├── profile
  ├── settings
  └── notifications

// ❌ 避免：过深的嵌套
user
  └── account
      └── settings
          └── privacy
              └── security
                  └── twoFactor
```

### 2. 按功能分组

将相关功能组织到同一个模块下：

```typescript
const store = createStore({
  user: {
    state: () => ({ ... }),
    modules: {
      // 个人信息相关
      profile: { ... },
      // 设置相关
      settings: { ... },
      // 通知相关
      notifications: { ... }
    }
  }
})
```

### 3. 保持模块独立

每个模块应该尽可能独立，避免模块间的强耦合：

```typescript
// ✅ 好：模块独立
modules: {
  profile: {
    state: () => ({ avatar: '' }),
    actions: {
      updateAvatar(url: string) {
        this.avatar = url
      }
    }
  }
}

// ❌ 避免：模块间直接访问
modules: {
  profile: {
    actions: {
      updateAvatar(url: string) {
        // 不要直接访问其他模块
        // parentStore.settings.theme = 'dark'
      }
    }
  }
}
```

### 4. 使用 TypeScript

为嵌套模块定义清晰的类型：

```typescript
interface GlobalState {
  user: {
    name: string
    modules: {
      profile: {
        avatar: string
      }
    }
  }
}

const store = createStore<GlobalState>({ ... })
```

## 迁移指南

### 从扁平结构迁移

如果你有现有的扁平模块结构：

```typescript
// 旧代码
const store = createStore({
  user: { state: () => ({ name: '' }) },
  userProfile: { state: () => ({ avatar: '' }) },
  userSettings: { state: () => ({ theme: 'light' }) }
})
```

可以逐步迁移到嵌套结构：

```typescript
// 新代码
const store = createStore({
  user: {
    state: () => ({ name: '' }),
    modules: {
      profile: { state: () => ({ avatar: '' }) },
      settings: { state: () => ({ theme: 'light' }) }
    }
  }
})
```

## 相关资源

- [API 文档](./api.md)
- [使用文档](./docs.md)
- [插件系统](./plugin-guide.md)
- [中间件系统](./middleware-guide.md)
