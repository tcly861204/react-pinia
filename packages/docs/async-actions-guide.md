# 异步 Actions 指南

React-Pinia 提供了 `defineAsyncAction` 辅助函数，帮助你轻松管理异步操作的状态。

## 简介

在处理异步操作时，通常需要管理三个状态：
- **loading**: 是否正在加载
- **error**: 错误信息
- **data**: 返回的数据

`defineAsyncAction` 自动为你管理这些状态，让代码更简洁。

## 基本用法

### 定义异步 Action

```typescript
import { defineStore, defineAsyncAction } from 'react-pinia'

interface User {
  id: number
  name: string
}

const useUserStore = defineStore({
  state: () => ({
    users: [] as User[],
    fetchUsers: defineAsyncAction(async () => {
      const response = await fetch('/api/users')
      return response.json()
    })
  }),
  actions: {
    async loadUsers() {
      const users = await this.fetchUsers.execute()
      this.users = users
      return users
    }
  }
})
```

### 在组件中使用

```typescript
function UserList() {
  const store = useUserStore()
  
  useEffect(() => {
    store.loadUsers()
  }, [])
  
  // 访问异步状态
  if (store.fetchUsers.state.loading) {
    return <div>Loading...</div>
  }
  
  if (store.fetchUsers.state.error) {
    return <div>Error: {store.fetchUsers.state.error.message}</div>
  }
  
  return (
    <ul>
      {store.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## API 参考

### `defineAsyncAction<T, R>(action)`

创建一个异步 Action。

**参数:**
- `action: (payload: T) => Promise<R>` - 异步函数

**返回:**
- `AsyncAction<T, R>` 对象，包含：
  - `state: AsyncActionState<R>` - 状态对象
    - `loading: boolean` - 是否正在加载
    - `error: Error | null` - 错误信息
    - `data: R | null` - 返回的数据
  - `execute: (payload: T) => Promise<R>` - 执行异步操作
  - `reset: () => void` - 重置状态

### `defineAsyncAction0<R>(action)`

创建一个无参数的异步 Action。

**参数:**
- `action: () => Promise<R>` - 无参数的异步函数

**返回:**
- 类似 `AsyncAction`，但 `execute` 方法不需要参数

## 实际应用示例

### 1. 带参数的异步 Action

```typescript
const useUserStore = defineStore({
  state: () => ({
    currentUser: null as User | null,
    fetchUser: defineAsyncAction(async (id: number) => {
      const response = await fetch(`/api/users/${id}`)
      return response.json()
    })
  }),
  actions: {
    async loadUser(id: number) {
      const user = await this.fetchUser.execute(id)
      this.currentUser = user
      return user
    }
  }
})
```

### 2. 错误处理

```typescript
const useDataStore = defineStore({
  state: () => ({
    fetchData: defineAsyncAction(async () => {
      const response = await fetch('/api/data')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
  }),
  actions: {
    async loadData() {
      try {
        return await this.fetchData.execute()
      } catch (error) {
        console.error('Failed to load data:', error)
        // 可以在这里处理错误，例如显示通知
      }
    }
  }
})

// 在组件中
function DataComponent() {
  const store = useDataStore()
  
  const handleRetry = () => {
    store.fetchData.reset() // 重置状态
    store.loadData()
  }
  
  if (store.fetchData.state.error) {
    return (
      <div>
        <p>Error: {store.fetchData.state.error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }
  
  // ...
}
```

### 3. 重置状态

```typescript
const useStore = defineStore({
  state: () => ({
    fetchData: defineAsyncAction(async () => {
      // ...
    })
  }),
  actions: {
    clearData() {
      this.fetchData.reset() // 清除 loading, error, data
    }
  }
})
```

## 最佳实践

### 1. 在 Actions 中调用

建议在 actions 中调用 `execute`，而不是直接在组件中调用：

```typescript
// ✅ 好
const useStore = defineStore({
  state: () => ({
    fetchData: defineAsyncAction(async () => { /* ... */ })
  }),
  actions: {
    async loadData() {
      return this.fetchData.execute()
    }
  }
})

// ❌ 避免
// 直接在组件中调用 store.fetchData.execute()
```

### 2. 组合多个异步 Action

```typescript
const useStore = defineStore({
  state: () => ({
    fetchUsers: defineAsyncAction(async () => { /* ... */ }),
    fetchPosts: defineAsyncAction(async () => { /* ... */ })
  }),
  actions: {
    async loadAll() {
      await Promise.all([
        this.fetchUsers.execute(),
        this.fetchPosts.execute()
      ])
    }
  }
})
```

### 3. 使用 TypeScript

充分利用 TypeScript 的类型推导：

```typescript
interface User {
  id: number
  name: string
}

const useStore = defineStore({
  state: () => ({
    // TypeScript 会自动推导 data 的类型为 User[]
    fetchUsers: defineAsyncAction<void, User[]>(async () => {
      const response = await fetch('/api/users')
      return response.json()
    })
  })
})
```

## 相关资源

- [API 文档](./api.md)
- [测试工具](./testing-guide.md)
