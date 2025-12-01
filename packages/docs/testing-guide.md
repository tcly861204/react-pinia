# 测试工具指南

React-Pinia 提供了一套专门的测试工具，帮助你轻松编写单元测试和集成测试。

## 简介

测试工具主要包含 `createTestStore` 函数，它提供以下功能：
- 快速创建测试用的 store
- 重置 store 状态
- 模拟 (Mock) action 实现
- 获取状态快照

## 基本用法

### 创建测试 Store

```typescript
import { createTestStore } from 'react-pinia'

const { store, useStore } = createTestStore({
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  }
})

// 直接访问 store 状态
console.log(store.count) // 0

// 在组件中使用 useStore
function MyComponent() {
  const s = useStore()
  return <div>{s.count}</div>
}
```

### 重置状态

在测试用例之间重置状态非常有用：

```typescript
const { store, reset } = createTestStore({
  state: () => ({ count: 0 })
})

test('重置状态', () => {
  store.count = 10
  expect(store.count).toBe(10)
  
  reset()
  
  expect(store.count).toBe(0)
})
```

### 模拟 Action

你可以模拟 action 来隔离测试或验证调用：

```typescript
const { store, mockAction } = createTestStore({
  state: () => ({ count: 0 }),
  actions: {
    async fetchData() {
      // 真实实现可能涉及网络请求
    }
  }
})

test('模拟 action', () => {
  const mockFn = vi.fn()
  
  // 替换原始 action
  const restore = mockAction('fetchData', mockFn)
  
  store.fetchData()
  expect(mockFn).toHaveBeenCalled()
  
  // 恢复原始 action
  restore()
})
```

### 状态快照

获取当前状态的深拷贝，用于断言：

```typescript
const { store, snapshot } = createTestStore({
  state: () => ({ user: { name: 'Alice' } })
})

test('状态快照', () => {
  store.user.name = 'Bob'
  
  expect(snapshot()).toEqual({
    user: { name: 'Bob' }
  })
})
```

## API 参考

### `createTestStore<T>(options: StateOption<T>): TestStore<T>`

创建一个测试用的 store 上下文。

**参数:**
- `options`: Store 配置选项，与 `defineStore` 相同。

**返回:**
- `useStore`: Store Hook，用于组件。
- `store`: 原始 Store 对象 (Proxy)。
- `reset()`: 重置状态为初始值。
- `mockAction(name, implementation)`: 模拟 action，返回还原函数。
- `snapshot()`: 获取状态快照。
