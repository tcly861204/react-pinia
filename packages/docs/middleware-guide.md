# 中间件系统指南

React-Pinia 提供了强大的中间件系统,允许你拦截和增强 action 调用。中间件可以用于日志记录、性能监控、数据验证、错误处理等场景。

## 简介

中间件是一个函数,它可以在 action 执行前后插入自定义逻辑。中间件遵循 Redux 风格的模式,支持组合和链式调用。

### 中间件的作用

- **日志记录**: 记录 action 调用和状态变化
- **性能监控**: 测量 action 执行时间
- **数据验证**: 在 action 执行前验证参数
- **错误处理**: 统一处理 action 中的错误
- **分析统计**: 收集用户行为数据
- **权限控制**: 检查用户权限后再执行 action

## 创建中间件

### 基本结构

中间件是一个三层嵌套的函数:

```typescript
import { Middleware } from 'react-pinia'

const myMiddleware: Middleware<any> = (context) => (next) => (action) => {
  // 在 action 执行前的逻辑
  console.log('Before action:', action.name)
  
  // 调用下一个中间件或 action
  const result = next(action)
  
  // 在 action 执行后的逻辑
  console.log('After action:', action.name)
  
  return result
}
```

### 中间件参数

#### 1. Context (上下文)

第一层函数接收 `MiddlewareContext`,包含:

```typescript
interface MiddlewareContext<T> {
  store: any              // store 实例
  getState: () => State<T> // 获取当前状态的函数
  options: StateOption<T>  // store 配置选项
}
```

#### 2. Next (下一个中间件)

第二层函数接收 `next` 函数,用于调用下一个中间件或最终的 action。

#### 3. Action (动作信息)

第三层函数接收 `ActionCall`,包含:

```typescript
interface ActionCall {
  name: string  // action 名称
  args: any[]   // action 参数
}
```

## 使用中间件

### 局部中间件

在 `defineStore` 中配置,只对当前 store 生效:

```typescript
import { defineStore } from 'react-pinia'

const loggingMiddleware: Middleware<any> = () => (next) => (action) => {
  console.log(`[Action] ${action.name}`, action.args)
  return next(action)
}

const useUserStore = defineStore({
  state: () => ({ name: 'Alice' }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  },
  middleware: [loggingMiddleware]
})
```

### 全局中间件

在 `createStore` 中配置,应用于所有 store 模块:

```typescript
import { createStore } from 'react-pinia'

const store = createStore({
  user: {
    state: () => ({ name: 'Alice' }),
    actions: {
      setName(name: string) {
        this.name = name
      }
    }
  },
  cart: {
    state: () => ({ items: [] }),
    actions: {
      addItem(item: any) {
        this.items.push(item)
      }
    }
  }
}, {
  middleware: [loggingMiddleware] // 应用于 user 和 cart
})
```

### 组合中间件

可以同时使用全局和局部中间件,执行顺序为:**全局中间件 → 局部中间件 → action**

```typescript
const globalMiddleware: Middleware<any> = () => (next) => (action) => {
  console.log('[Global]', action.name)
  return next(action)
}

const localMiddleware: Middleware<any> = () => (next) => (action) => {
  console.log('[Local]', action.name)
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
    middleware: [localMiddleware]
  }
}, {
  middleware: [globalMiddleware]
})

// 调用 setName 时输出:
// [Global] setName
// [Local] setName
```

## 实用示例

### 1. 日志中间件

记录所有 action 调用和执行时间:

```typescript
const loggerMiddleware: Middleware<any> = ({ getState }) => (next) => (action) => {
  const startTime = Date.now()
  console.group(`Action: ${action.name}`)
  console.log('Arguments:', action.args)
  console.log('State before:', getState())
  
  const result = next(action)
  
  console.log('State after:', getState())
  console.log('Duration:', Date.now() - startTime, 'ms')
  console.groupEnd()
  
  return result
}
```

### 2. 性能监控中间件

测量 action 执行时间并发送到分析服务:

```typescript
const performanceMiddleware: Middleware<any> = () => (next) => (action) => {
  const startTime = performance.now()
  
  const result = next(action)
  
  const duration = performance.now() - startTime
  
  // 发送到分析服务
  if (duration > 100) {
    console.warn(`Slow action: ${action.name} took ${duration}ms`)
    // analytics.track('slow_action', { name: action.name, duration })
  }
  
  return result
}
```

### 3. 数据验证中间件

在 action 执行前验证参数:

```typescript
const validationMiddleware: Middleware<any> = () => (next) => (action) => {
  // 验证规则
  const rules: Record<string, (args: any[]) => boolean> = {
    setAge: (args) => typeof args[0] === 'number' && args[0] >= 0,
    setEmail: (args) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args[0])
  }
  
  const validator = rules[action.name]
  if (validator && !validator(action.args)) {
    throw new Error(`Invalid arguments for action: ${action.name}`)
  }
  
  return next(action)
}
```

### 4. 错误处理中间件

统一捕获和处理 action 中的错误:

```typescript
const errorHandlerMiddleware: Middleware<any> = () => (next) => async (action) => {
  try {
    return await next(action)
  } catch (error: any) {
    console.error(`Error in action ${action.name}:`, error)
    
    // 发送错误报告
    // errorReporting.captureException(error, {
    //   action: action.name,
    //   args: action.args
    // })
    
    // 可以选择重新抛出或返回默认值
    throw error
  }
}
```

### 5. 权限控制中间件

检查用户权限:

```typescript
const authMiddleware: Middleware<any> = ({ getState }) => (next) => (action) => {
  // 需要权限的 action 列表
  const protectedActions = ['deleteUser', 'updateSettings']
  
  if (protectedActions.includes(action.name)) {
    const state = getState() as any
    if (!state.isAdmin) {
      throw new Error(`Unauthorized: ${action.name} requires admin privileges`)
    }
  }
  
  return next(action)
}
```

### 6. 异步 Action 支持

处理异步 action:

```typescript
const asyncMiddleware: Middleware<any> = () => (next) => async (action) => {
  console.log(`[Async] ${action.name} started`)
  
  try {
    const result = await next(action)
    console.log(`[Async] ${action.name} completed`)
    return result
  } catch (error) {
    console.error(`[Async] ${action.name} failed:`, error)
    throw error
  }
}
```

### 7. 修改参数中间件

在 action 执行前修改参数:

```typescript
const sanitizeMiddleware: Middleware<any> = () => (next) => (action) => {
  // 对字符串参数进行清理
  const sanitizedAction = {
    ...action,
    args: action.args.map(arg => 
      typeof arg === 'string' ? arg.trim() : arg
    )
  }
  
  return next(sanitizedAction)
}
```

### 8. 阻止 Action 执行

根据条件阻止 action 执行:

```typescript
const throttleMiddleware: Middleware<any> = () => {
  const lastCalled: Record<string, number> = {}
  const delay = 1000 // 1秒内只能调用一次
  
  return (next) => (action) => {
    const now = Date.now()
    const last = lastCalled[action.name] || 0
    
    if (now - last < delay) {
      console.warn(`Action ${action.name} throttled`)
      return // 阻止执行
    }
    
    lastCalled[action.name] = now
    return next(action)
  }
}
```

## 中间件执行顺序

多个中间件按照注册顺序执行:

```typescript
const middleware1: Middleware<any> = () => (next) => (action) => {
  console.log('1: before')
  const result = next(action)
  console.log('1: after')
  return result
}

const middleware2: Middleware<any> = () => (next) => (action) => {
  console.log('2: before')
  const result = next(action)
  console.log('2: after')
  return result
}

// 输出顺序:
// 1: before
// 2: before
// [action 执行]
// 2: after
// 1: after
```

## TypeScript 支持

为中间件添加类型约束:

```typescript
interface UserState {
  name: string
  age: number
}

const typedMiddleware: Middleware<UserState> = ({ getState, store }) => (next) => (action) => {
  const state = getState()
  // state 有完整的类型提示
  console.log('Current name:', state.name)
  
  return next(action)
}
```

## 最佳实践

### 1. 保持中间件简单

每个中间件应该只做一件事,遵循单一职责原则。

### 2. 注意性能

避免在中间件中执行耗时操作,特别是同步中间件。

### 3. 合理使用全局和局部中间件

- 全局中间件:日志、性能监控、错误处理
- 局部中间件:特定业务逻辑、数据验证

### 4. 处理异步 Action

确保中间件正确处理 Promise 返回值。

### 5. 避免修改 action 对象

如需修改参数,创建新对象而不是直接修改。

## 调试技巧

### 查看中间件执行流程

```typescript
const debugMiddleware: Middleware<any> = () => (next) => (action) => {
  console.trace(`Action: ${action.name}`)
  return next(action)
}
```

### 条件启用中间件

```typescript
const devMiddleware: Middleware<any> = () => (next) => (action) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Dev mode:', action.name)
  }
  return next(action)
}
```

## 与其他功能的集成

### 与 DevTools 配合

中间件和 DevTools 可以同时使用,互不影响:

```typescript
const useStore = defineStore({
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  },
  middleware: [loggingMiddleware],
  devtools: true
})
```

### 与插件配合

中间件在 action 层面工作,插件在 store 初始化时工作,两者互补。

## 相关资源

- [API 文档](./api.md)
- [插件系统指南](./plugin-guide.md)
- [DevTools 调试指南](./devtools-guide.md)
