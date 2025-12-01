# 订阅机制指南

React-Pinia 提供了强大的订阅机制，允许你监听状态变化和 action 调用，实现类似 Vuex/Pinia 的订阅功能。

## 简介

订阅机制让你能够：
- 监听状态的变化
- 监听 action 的调用
- 实现日志记录、数据持久化、分析统计等功能

## 状态订阅

### 基本用法

使用 `subscribe` 方法订阅状态变化：

```typescript
import { defineStore } from 'react-pinia'

const useStore = defineStore({
  state: () => ({ count: 0, name: 'Alice' })
})

// 订阅状态变化
const unsubscribe = useStore.subscribe((mutation, state) => {
  console.log('状态变化:', mutation.key)
  console.log('旧值:', mutation.oldValue)
  console.log('新值:', mutation.newValue)
  console.log('当前状态:', state)
})

// 修改状态会触发订阅
const store = useStore.get()
store.count = 1  // 触发订阅
store.name = 'Bob'  // 触发订阅

// 取消订阅
unsubscribe()
```

### Mutation 对象

订阅回调接收两个参数：

1. **mutation**: 状态变化信息
   ```typescript
   interface Mutation<T> {
     type: 'mutation'        // 固定为 'mutation'
     key: keyof State<T>     // 变化的状态键
     oldValue: any           // 旧值
     newValue: any           // 新值
     payload?: any           // 可选的载荷数据
   }
   ```

2. **state**: 变化后的完整状态

### 实际应用示例

#### 1. 日志记录

```typescript
const useStore = defineStore({
  state: () => ({ count: 0, user: { name: 'Alice' } })
})

useStore.subscribe((mutation, state) => {
  console.log(`[${new Date().toISOString()}] ${mutation.key} changed`)
  console.log(`  From: ${JSON.stringify(mutation.oldValue)}`)
  console.log(`  To: ${JSON.stringify(mutation.newValue)}`)
})
```

#### 2. 数据持久化

```typescript
useStore.subscribe((mutation, state) => {
  // 将状态保存到 localStorage
  localStorage.setItem('app-state', JSON.stringify(state))
})
```

#### 3. 数据验证

```typescript
useStore.subscribe((mutation, state) => {
  if (mutation.key === 'age' && mutation.newValue < 0) {
    console.warn('年龄不能为负数')
    // 可以选择回滚或修正
  }
})
```

## Action 订阅

### 基本用法

使用 `subscribeAction` 方法订阅 action 调用：

```typescript
const useStore = defineStore({
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
    add(n: number) {
      this.count += n
    }
  }
})

// 订阅 action 调用
const unsubscribe = useStore.subscribeAction((action, state) => {
  console.log('Action 调用:', action.name)
  console.log('参数:', action.args)
  console.log('时间戳:', action.timestamp)
})

// 调用 action 会触发订阅
const store = useStore.get()
store.increment()  // 触发订阅
store.add(5)       // 触发订阅

// 取消订阅
unsubscribe()
```

### ActionInfo 对象

订阅回调接收两个参数：

1. **action**: Action 调用信息
   ```typescript
   interface ActionInfo {
     name: string          // Action 名称
     args: any[]           // Action 参数
     timestamp?: number    // 调用时间戳
   }
   ```

2. **state**: 当前状态

### 实际应用示例

#### 1. 性能监控

```typescript
const actionTimes = new Map<string, number>()

useStore.subscribeAction((action) => {
  const startTime = action.timestamp || Date.now()
  actionTimes.set(action.name, startTime)
  
  // 可以在 action 完成后计算执行时间
  setTimeout(() => {
    const duration = Date.now() - startTime
    if (duration > 100) {
      console.warn(`慢 Action: ${action.name} 耗时 ${duration}ms`)
    }
  }, 0)
})
```

#### 2. 分析统计

```typescript
const actionStats = new Map<string, number>()

useStore.subscribeAction((action) => {
  const count = actionStats.get(action.name) || 0
  actionStats.set(action.name, count + 1)
  
  // 发送到分析服务
  // analytics.track('action_called', {
  //   name: action.name,
  //   args: action.args
  // })
})
```

#### 3. 权限检查

```typescript
useStore.subscribeAction((action, state) => {
  const protectedActions = ['deleteUser', 'updateSettings']
  
  if (protectedActions.includes(action.name)) {
    if (!(state as any).isAdmin) {
      console.error(`未授权: ${action.name} 需要管理员权限`)
      // 注意：订阅无法阻止 action 执行，只能记录
    }
  }
})
```

## 取消订阅

两种订阅方法都返回一个取消订阅函数：

```typescript
const unsubscribeState = useStore.subscribe((mutation, state) => {
  // ...
})

const unsubscribeAction = useStore.subscribeAction((action, state) => {
  // ...
})

// 取消订阅
unsubscribeState()
unsubscribeAction()
```

### 在 React 组件中使用

```typescript
function MyComponent() {
  useEffect(() => {
    const unsubscribe = useStore.subscribe((mutation, state) => {
      console.log('状态变化:', mutation)
    })
    
    // 组件卸载时取消订阅
    return () => {
      unsubscribe()
    }
  }, [])
  
  return <div>...</div>
}
```

## 多个订阅者

可以注册多个订阅者，它们会按注册顺序执行：

```typescript
// 订阅者 1
useStore.subscribe((mutation) => {
  console.log('订阅者 1:', mutation.key)
})

// 订阅者 2
useStore.subscribe((mutation) => {
  console.log('订阅者 2:', mutation.key)
})

// 订阅者 3
useStore.subscribe((mutation) => {
  console.log('订阅者 3:', mutation.key)
})

// 修改状态时，三个订阅者都会被调用
const store = useStore.get()
store.count = 1
// 输出:
// 订阅者 1: count
// 订阅者 2: count
// 订阅者 3: count
```

## 错误处理

订阅回调中的错误不会影响其他订阅者：

```typescript
useStore.subscribe(() => {
  throw new Error('订阅错误')
})

useStore.subscribe((mutation) => {
  console.log('这个订阅者仍然会执行')
})

const store = useStore.get()
store.count = 1
// 第一个订阅者抛出错误，但第二个仍然执行
```

## 异步 Action

订阅也支持异步 action：

```typescript
const useStore = defineStore({
  state: () => ({ data: null }),
  actions: {
    async fetchData() {
      const response = await fetch('/api/data')
      this.data = await response.json()
    }
  }
})

useStore.subscribeAction((action) => {
  console.log('Action 开始:', action.name)
  // 注意：这在 action 开始时触发，不是完成时
})
```

## 最佳实践

### 1. 避免在订阅中修改状态

```typescript
// ❌ 避免：可能导致无限循环
useStore.subscribe((mutation, state) => {
  state.count++  // 会触发新的订阅
})

// ✅ 好：只读取状态
useStore.subscribe((mutation, state) => {
  console.log('当前 count:', state.count)
})
```

### 2. 使用订阅进行副作用

订阅适合用于副作用，如日志、持久化、分析等：

```typescript
useStore.subscribe((mutation, state) => {
  // 日志
  logger.log(mutation)
  
  // 持久化
  saveToStorage(state)
  
  // 分析
  analytics.track('state_changed', mutation)
})
```

### 3. 及时取消订阅

避免内存泄漏，在不需要时取消订阅：

```typescript
useEffect(() => {
  const unsubscribe = useStore.subscribe(...)
  return () => unsubscribe()
}, [])
```

### 4. 订阅的性能考虑

订阅会在每次状态变化时执行，避免在订阅中执行耗时操作：

```typescript
// ❌ 避免：耗时操作
useStore.subscribe((mutation, state) => {
  // 复杂计算
  const result = heavyComputation(state)
})

// ✅ 好：使用防抖或节流
const debouncedLog = debounce((mutation) => {
  console.log(mutation)
}, 300)

useStore.subscribe((mutation) => {
  debouncedLog(mutation)
})
```

## 与其他功能的集成

### 与中间件配合

订阅和中间件可以同时使用，但它们的作用不同：

- **中间件**: 拦截和修改 action 执行
- **订阅**: 观察状态变化和 action 调用

```typescript
const useStore = defineStore({
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  },
  middleware: [loggingMiddleware]
})

// 订阅状态变化
useStore.subscribe((mutation) => {
  console.log('状态变化:', mutation)
})

// 订阅 action
useStore.subscribeAction((action) => {
  console.log('Action 调用:', action)
})
```

### 与 DevTools 配合

订阅和 DevTools 可以同时使用，互不影响。

## TypeScript 支持

订阅 API 提供完整的类型支持：

```typescript
interface UserState {
  name: string
  age: number
}

const useStore = defineStore<UserState>({
  state: () => ({ name: 'Alice', age: 25 })
})

useStore.subscribe((mutation, state) => {
  // mutation.key 有类型提示: 'name' | 'age'
  // state 有完整的类型
  console.log(state.name, state.age)
})
```

## 相关资源

- [API 文档](./api.md)
- [中间件系统](./middleware-guide.md)
- [插件系统](./plugin-guide.md)
- [DevTools 调试指南](./devtools-guide.md)
