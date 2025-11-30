# API 参考

完整的 React-Pinia API 文档。

## createStore

创建一个全局状态管理 store。

### 类型签名

```typescript
function createStore<T extends { [K in keyof T]: T[K] }>(
  options: {
    [K in keyof T]: StateOption<T[K]>
  }
): Store<T>
```

### 参数

- **options**: `Object` - Store 配置对象
  - 键名为模块名称
  - 值为 `StateOption` 配置

### 返回值

返回一个 Store 实例，包含所有定义的模块。

### 示例

```typescript
const store = createStore<State>({
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
  },
})
```

## Provider

React 组件，用于向子组件提供 store。

### Props

- **store**: `Store` - createStore 返回的 store 实例
- **children**: `ReactNode` - 子组件

### 示例

```tsx
<Provider store={store}>
  <App />
</Provider>
```

## useStore

React Hook，用于在组件中访问 store。

### 类型签名

```typescript
// 获取完整状态
function useStore<T, K extends keyof T>(
  key: K
): State<T[K]> & Getters<T[K]> & Actions<T[K]> | null

// 使用 selector
function useStore<T, K extends keyof T, S>(
  key: K,
  selector: (state: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
): S | null
```

### 参数

- **key**: `string` - 模块的键名
- **selector**: `Function` (可选) - 选择器函数，用于选择部分状态

### 返回值

- 不使用 selector：返回完整的状态对象（包含 state、getters、actions）
- 使用 selector：返回 selector 函数的返回值
- 如果模块不存在：返回 `null`

### 示例

```typescript
// 获取完整状态
const user = useStore<State, 'user'>('user')

// 使用 selector
const name = useStore<State, 'user', string>(
  'user',
  (state) => state.name
)
```

## StateOption

定义单个 store 模块的配置选项。

### 类型定义

```typescript
interface StateOption<T> {
  state: () => State<T>
  actions?: {
    [key: string]: (this: State<T>, ...args: any[]) => unknown
  }
  getters?: {
    [key: string]: (state: State<T>) => unknown
  }
  persist?: Persist
  deep?: boolean
}
```

### 属性

#### state

- **类型**: `() => State<T>`
- **必需**: 是
- **描述**: 返回初始状态的函数

```typescript
state: () => ({
  count: 0,
  name: 'Alice',
})
```

#### actions

- **类型**: `Object`
- **必需**: 否
- **描述**: 定义修改状态的方法，`this` 指向当前状态

```typescript
actions: {
  increment() {
    this.count++
  },
  setName(name: string) {
    this.name = name
  },
}
```

#### getters

- **类型**: `Object`
- **必需**: 否
- **描述**: 定义计算属性，基于状态派生新值

```typescript
getters: {
  doubleCount(state) {
    return state.count * 2
  },
  fullName(state) {
    return `${state.firstName} ${state.lastName}`
  },
}
```

#### persist

- **类型**: `Persist`
- **必需**: 否
- **描述**: 持久化配置

```typescript
persist: {
  key: 'my-store',
  storage: 'localStorage', // 或 'sessionStorage'
}
```

#### deep

- **类型**: `boolean`
- **必需**: 否
- **默认值**: `true`
- **描述**: 是否深度监听嵌套对象

```typescript
deep: false // 关闭深度监听
```

## Persist

持久化配置类型。

### 类型定义

```typescript
interface Persist {
  key: string
  storage?: 'localStorage' | 'sessionStorage'
}
```

### 属性

- **key**: `string` - 存储的键名
- **storage**: `'localStorage' | 'sessionStorage'` - 存储类型，默认 `'localStorage'`

### 示例

```typescript
persist: {
  key: 'user-data',
  storage: 'sessionStorage',
}
```

## 类型工具

### State\<T\>

提取状态类型（排除 actions 和 getters）。

```typescript
type State<T> = Omit<T, 'actions' | 'getters'>
```

### Getters\<T\>

提取 getters 类型。

```typescript
type Getters<T> = T extends { getters: infer G } ? G : {}
```

### Actions\<T\>

提取 actions 类型。

```typescript
type Actions<T> = T extends { actions: infer A } ? A : {}
```

## Store 实例方法

### get()

获取原始状态对象（不触发 React 渲染）。

```typescript
const rawState = store.user.get()
console.log(rawState.name)

// 修改状态
rawState.name = 'Bob'
```

::: warning 注意
`get()` 返回的是原始状态对象，修改它会影响所有订阅者，但不会自动触发组件重渲染。主要用于在组件外部访问或修改状态。
:::

## 完整示例

```typescript
import { createStore, Provider, useStore } from 'react-pinia'

// 1. 定义类型
interface UserState {
  name: string
  age: number
  actions: {
    setName(name: string): void
    incrementAge(): void
  }
  getters: {
    displayName: string
    isAdult: boolean
  }
}

interface State {
  user: UserState
}

// 2. 创建 store
const store = createStore<State>({
  user: {
    state: () => ({
      name: 'Alice',
      age: 25,
    }),
    actions: {
      setName(name: string) {
        this.name = name
      },
      incrementAge() {
        this.age++
      },
    },
    getters: {
      displayName(state) {
        return `User: ${state.name}`
      },
      isAdult(state) {
        return state.age >= 18
      },
    },
    persist: {
      key: 'user-store',
      storage: 'localStorage',
    },
  },
})

// 3. 提供 store
function App() {
  return (
    <Provider store={store}>
      <UserProfile />
    </Provider>
  )
}

// 4. 使用 store
function UserProfile() {
  const user = useStore<State, 'user'>('user')

  return (
    <div>
      <h1>{user?.displayName}</h1>
      <p>Age: {user?.age}</p>
      <p>{user?.isAdult ? '成年人' : '未成年'}</p>
      <button onClick={() => user?.incrementAge()}>
        增加年龄
      </button>
    </div>
  )
}
```

## TypeScript 支持

React-Pinia 提供完整的 TypeScript 支持。所有类型都会自动推导：

```typescript
const user = useStore<State, 'user'>('user')

// ✅ TypeScript 知道这些属性和方法
user?.name        // string
user?.age         // number
user?.displayName // string (getter)
user?.isAdult     // boolean (getter)
user?.setName     // (name: string) => void (action)

// ❌ TypeScript 会报错
user?.unknownProp // Error: Property 'unknownProp' does not exist
```

## 最佳实践

### 1. 始终定义类型

```typescript
// ✅ 好
interface UserState { /* ... */ }
const store = createStore<State>({ /* ... */ })

// ❌ 不好
const store = createStore({ /* ... */ }) // 缺少类型
```

### 2. 使用 Selector 优化性能

```typescript
// ✅ 好：只订阅 name
const name = useStore<State, 'user', string>(
  'user',
  (state) => state.name
)

// ❌ 不好：订阅整个对象
const user = useStore<State, 'user'>('user')
const name = user?.name
```

### 3. Actions 中处理副作用

```typescript
// ✅ 好
actions: {
  async loadData() {
    this.loading = true
    const data = await fetchData()
    this.data = data
    this.loading = false
  }
}

// ❌ 不好：在组件中处理
const user = useStore<State, 'user'>('user')
const loadData = async () => {
  user.loading = true
  const data = await fetchData()
  user.data = data
  user.loading = false
}
```
