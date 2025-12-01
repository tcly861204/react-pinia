# 持久化增强指南

React-Pinia 提供了增强的持久化功能，允许你更精细地控制状态的保存和恢复。

## 功能特性

- **路径过滤**: 只持久化部分状态。
- **自定义存储**: 支持 localStorage 和 sessionStorage。
- **自定义序列化**: 支持自定义序列化和反序列化逻辑。
- **加密支持**: 支持对持久化数据进行加密。
- **生命周期钩子**: 提供恢复前和恢复后的钩子函数。

## API 参考

```typescript
interface PersistOptions {
  key: string
  storage?: 'localStorage' | 'sessionStorage'
  paths?: string[]
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
  beforeRestore?: (savedState: any) => any
  afterRestore?: (restoredState: any) => void
  encryption?: {
    encrypt: (value: string) => string
    decrypt: (value: string) => string
  }
  debug?: boolean
}
```

## 使用示例

### 1. 路径过滤

只持久化 `user` 模块，忽略 `temp` 数据：

```typescript
const useStore = defineStore({
  state: () => ({ 
    user: { name: 'Alice', token: 'secret' },
    temp: { data: [] }
  }),
  persist: {
    key: 'my-app',
    paths: ['user'] // 只保存 user
  }
})
```

### 2. 自定义序列化

使用自定义的序列化逻辑（例如处理 Date 对象）：

```typescript
const useStore = defineStore({
  state: () => ({ date: new Date() }),
  persist: {
    key: 'date-store',
    serializer: {
      serialize: (state) => JSON.stringify(state),
      deserialize: (raw) => {
        const state = JSON.parse(raw)
        state.date = new Date(state.date)
        return state
      }
    }
  }
})
```

### 3. 加密数据

对存储的数据进行简单的加密（注意：前端加密仅提供基础保护）：

```typescript
const useStore = defineStore({
  state: () => ({ secret: '123456' }),
  persist: {
    key: 'secure-store',
    encryption: {
      encrypt: (data) => btoa(data), // Base64 编码示例
      decrypt: (data) => atob(data)
    }
  }
})
```

### 4. 生命周期钩子

在状态恢复前后执行逻辑：

```typescript
const useStore = defineStore({
  state: () => ({ version: 1, data: [] }),
  persist: {
    key: 'app-v1',
    beforeRestore: (savedState) => {
      // 迁移数据结构
      if (savedState.version < 1) {
        savedState.data = []
        savedState.version = 1
      }
      return savedState
    },
    afterRestore: (state) => {
      console.log('状态已恢复:', state)
    }
  }
})
```
