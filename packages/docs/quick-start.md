# 快速开始

本指南将帮助你在 5 分钟内开始使用 React-Pinia。

## 安装

```bash
npm install react-pinia
```

## 三步上手

### 第一步：创建 Store

创建 `src/store/index.ts`：

```typescript
import { createStore } from 'react-pinia'

// 定义状态类型
interface CounterState {
  count: number
  actions: {
    increment(): void
  }
}

interface State {
  counter: CounterState
}

// 创建 store
const store = createStore<State>({
  counter: {
    state: () => ({ count: 0 }),
    actions: {
      increment() {
        this.count++
      },
    },
  },
})

export default store
```

### 第二步：提供 Store

在 `src/App.tsx` 中使用 Provider：

```tsx
import { Provider } from 'react-pinia'
import store from './store'
import Counter from './Counter'

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}

export default App
```

### 第三步：使用 Store

创建 `src/Counter.tsx`：

```tsx
import { useStore } from 'react-pinia'
import type { State } from './store'

function Counter() {
  const counter = useStore<State, 'counter'>('counter')

  return (
    <div>
      <p>Count: {counter?.count}</p>
      <button onClick={() => counter?.increment()}>+1</button>
    </div>
  )
}

export default Counter
```

## 完成！

现在你已经成功创建了第一个 React-Pinia 应用！

## 下一步

- 📖 阅读[完整文档](/docs)了解更多特性
- 💡 查看[示例代码](/examples)学习最佳实践
- 🚀 探索高级特性如持久化、Getters 等

## 常见问题

### TypeScript 类型提示不工作？

确保你正确定义了状态类型：

```typescript
// ✅ 正确
const counter = useStore<State, 'counter'>('counter')

// ❌ 错误
const counter = useStore('counter') // 缺少类型参数
```

### 状态没有更新？

确保在 actions 中修改状态：

```typescript
// ✅ 正确
actions: {
  increment() {
    this.count++ // 直接修改
  }
}

// ❌ 错误
actions: {
  increment() {
    return { count: this.count + 1 } // 不要返回新对象
  }
}
```

### 如何在组件外使用 store？

使用 `get()` 方法：

```typescript
const state = store.counter.get()
console.log(state.count)
```
