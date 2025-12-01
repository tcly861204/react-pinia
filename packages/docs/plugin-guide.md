# 插件系统指南

React-Pinia 提供了一个灵活的插件系统，允许你扩展 store 的功能、修改 state、添加全局属性或方法，以及集成第三方工具。

## 简介

插件是一个函数或对象，它接收一个上下文对象（context），并可以对 store 进行操作。插件可以全局应用于所有 store，也可以局部应用于特定的 store。

## 创建插件

插件支持两种定义方式：函数式和对象式。

### 1. 函数式插件

这是最简单的插件形式，直接定义一个函数：

```typescript
import { PiniaPlugin } from 'react-pinia'

const myPlugin: PiniaPlugin = ({ store }) => {
  // 为 store 添加一个自定义属性
  store.myCustomProperty = 'hello'
  
  // 监听 store 的变化（如果有相关 API 支持）
  // ...
}
```

### 2. 对象式插件

对象式插件需要包含一个 `install` 方法。这种方式适合需要更复杂配置或状态的插件。

```typescript
import { PiniaPlugin } from 'react-pinia'

const myObjectPlugin: PiniaPlugin = {
  install: ({ store, options }) => {
    console.log(`Installing plugin for store: ${options.name || 'anonymous'}`)
    store.$log = (msg: string) => console.log(`[${options.name}] ${msg}`)
  }
}
```

## 插件上下文 (Context)

插件接收一个 `PluginContext` 对象，包含以下属性：

- **store**: 当前正在初始化的 store 实例。你可以直接修改它，添加属性、方法或订阅变化。
- **options**: 定义 store 时传入的配置对象（`state`, `actions`, `getters` 等）。
- **pinia**: Pinia 实例上下文，包含 `_s` (store 映射) 等内部信息。

```typescript
export interface PluginContext {
  store: any
  options: StateOption<any>
  pinia: Pinia
}
```

## 使用插件

### 全局插件

通过 `createStore` 的第二个参数配置全局插件，这些插件会应用于该 `createStore` 创建的所有 store 模块。

```typescript
import { createStore } from 'react-pinia'

const store = createStore({
  user: { state: () => ({ name: 'Alice' }) },
  cart: { state: () => ({ items: [] }) }
}, {
  plugins: [myGlobalPlugin] // 应用于 user 和 cart
})
```

### 局部插件

在 `defineStore` 中配置 `plugins` 选项，只对当前 store 生效。

```typescript
import { defineStore } from 'react-pinia'

const useUserStore = defineStore({
  state: () => ({ name: 'Bob' }),
  plugins: [myLocalPlugin] // 仅应用于此 store
})
```

## 示例：持久化插件

这是一个简单的持久化插件示例，它将 state 自动保存到 localStorage。

```typescript
const persistPlugin: PiniaPlugin = ({ store, options }) => {
  // 假设 options 中有一个自定义的 persist key
  if (options.persist?.key) {
    const key = options.persist.key
    
    // 1. 初始化时恢复数据
    const saved = localStorage.getItem(key)
    if (saved) {
      Object.assign(store, JSON.parse(saved))
    }
    
    // 2. 订阅变化并保存 (这里假设有一个 subscribe 方法，实际取决于具体实现)
    // 注意：React-Pinia 核心可能需要暴露订阅能力给插件，
    // 或者插件可以通过包装 action 来实现简单的拦截。
    
    // 简单示例：拦截所有 action
    if (options.actions) {
      Object.keys(options.actions).forEach(actionKey => {
        const original = store[actionKey]
        store[actionKey] = (...args: any[]) => {
          const result = original.apply(store, args)
          // Action 执行后保存状态
          localStorage.setItem(key, JSON.stringify(store))
          return result
        }
      })
    }
  }
}
```

## TypeScript 支持

为了获得更好的类型提示，你可以扩展 `PiniaCustomProperties` 接口（如果库支持这样做），或者在你的项目中进行类型声明合并。

```typescript
// types.d.ts
import 'react-pinia'

declare module 'react-pinia' {
  export interface PiniaCustomProperties {
    myCustomProperty: string
    $log: (msg: string) => void
  }
}
```

这样，在使用 `store.myCustomProperty` 时就会有自动补全和类型检查。
