# React-Pinia 使用文档

## 简介

React-Pinia 是一个轻量级的 React 状态管理库，灵感来自 Vue 的 Pinia。它提供了简洁的 API 和强大的类型支持，让状态管理变得简单而优雅。

## 特性

- 🍍 **简洁的 API** - 受 Pinia 启发的直观 API 设计
- 🎯 **TypeScript 支持** - 完整的类型推导和类型安全
- ⚡ **高性能** - 基于 Proxy 的响应式系统和选择器优化
- 🔥 **轻量级** - 核心代码极小，无额外依赖
- 💾 **持久化** - 内置 localStorage/sessionStorage 支持
- 🎨 **灵活** - 支持多 store、嵌套状态和异步操作

## 安装

```bash
npm install react-pinia
# 或
yarn add react-pinia
# 或
pnpm add react-pinia
```

## 快速开始

### 1. 创建 Store

```typescript
import { createStore } from 'react-pinia'

// 定义状态类型
interface CounterState {
  count: number
  actions: {
    increment(): void
    decrement(): void
  }
  getters: {
    doubleCount: number
  }
}

interface State {
  counter: CounterState
}

// 创建 store
const store = createStore<State>({
  counter: {
    state: () => ({
      count: 0,
    }),
    actions: {
      increment() {
        this.count++
      },
      decrement() {
        this.count--
      },
    },
    getters: {
      doubleCount(state) {
        return state.count * 2
      },
    },
  },
})

export default store
```

### 2. 提供 Store

在应用的根组件使用 `Provider` 提供 store：

```tsx
import { Provider } from 'react-pinia'
import store from './store'

function App() {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  )
}
```

### 3. 使用 Store

在组件中使用 `useStore` 访问状态：

```tsx
import { useStore } from 'react-pinia'
import type { State } from './store'

function Counter() {
  const counter = useStore<State, 'counter'>('counter')

  return (
    <div>
      <p>Count: {counter?.count}</p>
      <p>Double: {counter?.doubleCount}</p>
      <button onClick={() => counter?.increment()}>+1</button>
      <button onClick={() => counter?.decrement()}>-1</button>
    </div>
  )
}
```

## 核心概念

### State（状态）

State 是 store 的核心，定义了应用的数据结构。

```typescript
const store = createStore<State>({
  user: {
    state: () => ({
      name: 'Alice',
      age: 25,
      profile: {
        email: 'alice@example.com',
        avatar: '/avatar.png',
      },
    }),
  },
})
```

### Actions（操作）

Actions 用于修改状态，支持同步和异步操作。在 action 中，`this` 指向当前状态。

```typescript
const store = createStore<State>({
  user: {
    state: () => ({
      name: '',
      loading: false,
    }),
    actions: {
      // 同步 action
      setName(name: string) {
        this.name = name
      },
      
      // 异步 action
      async fetchUser(id: number) {
        this.loading = true
        try {
          const response = await fetch(`/api/users/${id}`)
          const data = await response.json()
          this.name = data.name
        } finally {
          this.loading = false
        }
      },
    },
  },
})
```

### Getters（计算属性）

Getters 用于派生状态，类似于 Vue 的 computed。

```typescript
const store = createStore<State>({
  user: {
    state: () => ({
      firstName: 'John',
      lastName: 'Doe',
    }),
    getters: {
      fullName(state) {
        return `${state.firstName} ${state.lastName}`
      },
    },
  },
})
```

### Selector（选择器）

使用 selector 可以只订阅部分状态，优化性能：

```tsx
function UserName() {
  // 只订阅 name，其他状态变化不会触发重渲染
  const name = useStore<State, 'user', string>(
    'user',
    (state) => state.name
  )

  return <div>{name}</div>
}
```

## 高级特性

### 多 Store 管理

```typescript
interface GlobalState {
  user: UserState
  counter: CounterState
  todos: TodoState
}

const store = createStore<GlobalState>({
  user: {
    state: () => ({ name: 'Alice' }),
    // ...
  },
  counter: {
    state: () => ({ count: 0 }),
    // ...
  },
  todos: {
    state: () => ({ items: [] }),
    // ...
  },
})
```

### 持久化

使用 `persist` 选项将状态持久化到 localStorage 或 sessionStorage：

```typescript
const store = createStore<State>({
  user: {
    state: () => ({
      token: null,
      userInfo: null,
    }),
    // 持久化到 localStorage
    persist: {
      key: 'user-store',
      storage: 'localStorage', // 或 'sessionStorage'
    },
  },
})
```

### 直接访问状态

使用 `get()` 方法可以在组件外部访问状态：

```typescript
// 在组件外部
const rawState = store.user.get()
console.log(rawState.name)

// 修改状态
rawState.name = 'Bob'
```

### 深度监听控制

默认情况下，嵌套对象会被深度监听。可以通过 `deep` 选项控制：

```typescript
const store = createStore<State>({
  data: {
    state: () => ({
      nested: { value: 1 },
    }),
    deep: false, // 关闭深度监听
  },
})
```

## API 参考

### createStore

创建一个全局 store。

```typescript
function createStore<T>(options: {
  [K in keyof T]: StateOption<T[K]>
}): Store<T>
```

**参数：**
- `options`: 包含各个模块配置的对象

**返回：**
- Store 实例

### Provider

提供 store 给子组件。

```tsx
<Provider store={store}>
  {children}
</Provider>
```

**Props：**
- `store`: createStore 返回的 store 实例
- `children`: 子组件

### useStore

在组件中访问 store。

```typescript
// 获取完整状态
function useStore<T, K extends keyof T>(
  key: K
): State<T[K]> & Getters<T[K]> & Actions<T[K]>

// 使用 selector
function useStore<T, K extends keyof T, S>(
  key: K,
  selector: (state: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
): S
```

**参数：**
- `key`: store 模块的键名
- `selector`: 可选的选择器函数

**返回：**
- 状态对象或选择器返回值

### StateOption

定义 store 模块的配置。

```typescript
interface StateOption<T> {
  state: () => State<T>
  actions?: {
    [key: string]: (this: State<T>, ...args: any[]) => unknown
  }
  getters?: {
    [key: string]: (state: State<T>) => unknown
  }
  persist?: {
    key: string
    storage?: 'localStorage' | 'sessionStorage'
  }
  deep?: boolean
}
```

## 最佳实践

### 1. 类型定义

始终为 store 定义完整的 TypeScript 类型：

```typescript
// 定义状态类型
interface UserState {
  name: string
  age: number
  actions: {
    setName(name: string): void
    setAge(age: number): void
  }
  getters: {
    displayName: string
  }
}

interface State {
  user: UserState
}

// 使用类型
const store = createStore<State>({
  // ...
})
```

### 2. 模块化组织

将大型 store 拆分为多个模块：

```
store/
  ├── index.ts       # 导出主 store
  ├── user.ts        # 用户模块
  ├── counter.ts     # 计数器模块
  └── todos.ts       # 待办事项模块
```

### 3. 使用 Selector 优化性能

对于大型状态对象，使用 selector 只订阅需要的部分：

```tsx
// ❌ 不好：订阅整个 user 对象
const user = useStore<State, 'user'>('user')

// ✅ 好：只订阅 name
const name = useStore<State, 'user', string>(
  'user',
  (state) => state.name
)
```

### 4. Actions 中处理副作用

将所有副作用（API 调用、定时器等）放在 actions 中：

```typescript
actions: {
  async loadData() {
    this.loading = true
    try {
      const data = await fetchData()
      this.data = data
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
}
```

### 5. 合理使用持久化

只持久化必要的数据，避免持久化敏感信息：

```typescript
// ✅ 好：持久化用户偏好
persist: {
  key: 'user-preferences',
  storage: 'localStorage',
}

// ❌ 不好：持久化敏感数据
// 不要持久化密码、token 等敏感信息到 localStorage
```

## 常见问题

### Q: 如何在组件外部使用 store？

A: 使用 `get()` 方法：

```typescript
const userState = store.user.get()
console.log(userState.name)
```

### Q: 如何重置状态？

A: 创建一个 reset action：

```typescript
actions: {
  reset() {
    Object.assign(this, initialState)
  }
}
```

### Q: 支持 Redux DevTools 吗？

A: 目前不支持，但可以通过 `get()` 方法在控制台查看状态。

### Q: 如何处理异步操作？

A: 在 actions 中使用 async/await：

```typescript
actions: {
  async fetchUser(id: number) {
    this.loading = true
    const user = await api.getUser(id)
    this.user = user
    this.loading = false
  }
}
```

## 与其他库对比

| 特性 | React-Pinia | Redux | Zustand | Jotai |
|------|-------------|-------|---------|-------|
| 学习曲线 | 低 | 高 | 低 | 中 |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| 包大小 | 极小 | 大 | 小 | 小 |
| DevTools | ❌ | ✅ | ✅ | ✅ |
| 持久化 | ✅ 内置 | 需插件 | 需插件 | 需插件 |
| API 风格 | Pinia-like | Flux | Hooks | Atomic |

## 贡献

欢迎贡献代码！请查看 [GitHub 仓库](https://github.com/tcly861204/react-pinia)。

## 许可证

MIT License
