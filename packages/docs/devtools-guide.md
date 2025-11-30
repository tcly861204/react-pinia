# DevTools 调试指南

## 简介

React-Pinia 集成了 Redux DevTools Extension，为您提供强大的状态调试功能。通过 DevTools，您可以：

- 📊 **实时查看状态变化** - 追踪每一次状态更新
- 🎬 **Action 追踪** - 记录所有 action 调用及其参数和结果
- ⏱️ **时间旅行调试** - 回到任意历史状态
- 💾 **状态导入/导出** - 保存和恢复状态快照
- 🔍 **状态检查** - 深入查看状态结构

## 安装 Redux DevTools Extension

在使用 DevTools 功能之前，您需要安装 Redux DevTools Extension：

### Chrome
访问 [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) 安装扩展

### Firefox
访问 [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/) 安装扩展

### Edge
访问 [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) 安装扩展

## 基础配置

### 启用 DevTools

最简单的方式是在 `defineStore` 中设置 `devtools: true`：

```typescript
import { defineStore } from 'react-pinia'

const useCounterStore = defineStore({
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  },
  // 启用 DevTools
  devtools: true
})
```

### 自定义配置

您可以通过对象配置来自定义 DevTools 行为：

```typescript
const useUserStore = defineStore({
  state: () => ({
    user: null,
    isLoggedIn: false
  }),
  actions: {
    login(username: string, password: string) {
      // 登录逻辑
    }
  },
  devtools: {
    enabled: true,           // 是否启用
    name: 'User Store',      // 在 DevTools 中显示的名称
    trace: true              // 启用堆栈追踪
  }
})
```

## 配置选项

### DevToolsOptions

```typescript
interface DevToolsOptions {
  // 是否启用 DevTools（默认：false）
  enabled?: boolean
  
  // 在 DevTools 中显示的 Store 名称（默认：'React-Pinia Store'）
  name?: string
  
  // 是否启用堆栈追踪，帮助定位 action 调用位置（默认：false）
  trace?: boolean
}
```

## 使用 DevTools

### 查看状态变化

1. 打开浏览器的开发者工具（F12）
2. 切换到 "Redux" 标签页
3. 在左侧面板中选择您的 Store（如 "React-Pinia Store"）
4. 右侧会显示当前状态和历史记录

### Action 追踪

每次调用 action 时，DevTools 会记录：

- **Action 名称** - 如 `Action: increment`
- **参数** - action 调用时传入的参数
- **执行结果** - 同步 action 的返回值或异步 action 的 Promise 结果
- **状态快照** - action 执行后的完整状态

#### 同步 Action

```typescript
const useCounterStore = defineStore({
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    }
  },
  devtools: true
})

// 在组件中调用
const Counter = () => {
  const store = useCounterStore()
  
  // 点击按钮时，DevTools 会显示：
  // Action: increment ✓
  return <button onClick={store.increment}>+1</button>
}
```

#### 异步 Action

```typescript
const useUserStore = defineStore({
  state: () => ({
    user: null,
    loading: false
  }),
  actions: {
    async fetchUser(id: string) {
      this.loading = true
      try {
        const response = await fetch(`/api/users/${id}`)
        this.user = await response.json()
        return this.user
      } finally {
        this.loading = false
      }
    }
  },
  devtools: true
})

// DevTools 会显示三个事件：
// 1. Action: fetchUser (开始)
// 2. Mutation: loading (状态变化)
// 3. Action: fetchUser ✓ (成功) 或 Action: fetchUser ✗ (失败)
```

### 时间旅行调试

时间旅行功能允许您回到任意历史状态，非常适合调试复杂的状态变化。

#### 跳转到历史状态

1. 在 DevTools 的左侧面板中，点击任意历史记录
2. 应用会立即恢复到该时刻的状态
3. 您可以继续操作，也可以跳转到其他状态

#### 重置状态

点击 DevTools 底部的 "Reset" 按钮，状态会恢复到初始值。

#### 提交状态

点击 "Commit" 按钮，将当前状态设为新的初始状态，清空历史记录。

#### 回滚状态

点击 "Rollback" 按钮，回滚到上次提交的状态。

### 状态导入/导出

#### 导出状态

1. 点击 DevTools 底部的下载图标
2. 选择 "Export" 导出当前状态和历史记录
3. 保存为 JSON 文件

#### 导入状态

1. 点击 DevTools 底部的上传图标
2. 选择之前导出的 JSON 文件
3. 状态和历史记录会被恢复

这个功能非常适合：
- 保存和分享 bug 复现场景
- 在不同环境间同步状态
- 创建测试数据快照

## 高级用法

### 手动设置 DevTools

如果您需要更多控制，可以手动调用 `setupDevTools`：

```typescript
import { setupDevTools } from 'react-pinia'

const store = { count: 0 }
const options = {
  state: () => ({ count: 0 }),
  devtools: {
    enabled: true,
    name: 'Manual Store'
  }
}

const devtools = setupDevTools(store, options, (newState) => {
  // 自定义状态恢复逻辑
  Object.assign(store, newState)
})

// 手动发送事件
devtools?.send({ type: 'CUSTOM_EVENT', payload: { data: 'test' } }, store)

// 订阅 DevTools 消息
devtools?.subscribe((message) => {
  console.log('DevTools message:', message)
})

// 断开连接
devtools?.disconnect()
```

### 条件启用 DevTools

通常只在开发环境启用 DevTools：

```typescript
const useStore = defineStore({
  state: () => ({ count: 0 }),
  devtools: process.env.NODE_ENV === 'development'
})
```

或者使用环境变量：

```typescript
const useStore = defineStore({
  state: () => ({ count: 0 }),
  devtools: {
    enabled: process.env.REACT_APP_ENABLE_DEVTOOLS === 'true',
    name: 'My Store'
  }
})
```

## 最佳实践

### 1. 使用有意义的 Store 名称

为每个 Store 设置清晰的名称，便于在 DevTools 中识别：

```typescript
const useUserStore = defineStore({
  state: () => ({ /* ... */ }),
  devtools: { name: 'User Store' }
})

const useCartStore = defineStore({
  state: () => ({ /* ... */ }),
  devtools: { name: 'Shopping Cart' }
})
```

### 2. 启用堆栈追踪

在调试复杂问题时，启用 `trace` 选项可以帮助定位 action 调用位置：

```typescript
const useStore = defineStore({
  state: () => ({ /* ... */ }),
  devtools: {
    enabled: true,
    trace: true  // 启用堆栈追踪
  }
})
```

### 3. 生产环境禁用 DevTools

DevTools 会带来一定的性能开销，建议在生产环境禁用：

```typescript
const useStore = defineStore({
  state: () => ({ /* ... */ }),
  devtools: process.env.NODE_ENV !== 'production'
})
```

### 4. 使用时间旅行调试复杂流程

对于涉及多个 action 的复杂流程，使用时间旅行功能可以快速定位问题：

1. 重现问题
2. 在 DevTools 中回溯历史记录
3. 找到状态异常的那一步
4. 检查对应的 action 和参数

### 5. 导出状态用于测试

将特定场景的状态导出，可以用于：
- 创建单元测试的初始状态
- 分享 bug 复现步骤
- 建立测试数据库

## 故障排除

### DevTools 不显示

**问题**: 打开开发者工具后找不到 Redux 标签页

**解决方案**:
1. 确认已安装 Redux DevTools Extension
2. 检查 `devtools` 选项是否设置为 `true` 或有效的配置对象
3. 刷新页面
4. 检查浏览器控制台是否有错误信息

### 状态不更新

**问题**: 在 DevTools 中看不到状态变化

**解决方案**:
1. 确认 action 确实被调用了
2. 检查是否正确修改了状态（直接修改 `this.xxx`）
3. 查看控制台是否有错误信息

### 时间旅行不工作

**问题**: 点击历史记录后状态没有恢复

**解决方案**:
1. 确认使用的是最新版本的 react-pinia
2. 检查是否有自定义的状态恢复逻辑干扰
3. 尝试重新加载页面

## 示例项目

完整的示例项目请参考：[examples/devtools-demo](../example)

## 相关资源

- [Redux DevTools Extension 文档](https://github.com/reduxjs/redux-devtools)
- [React-Pinia API 文档](./api-reference.md)
- [最佳实践指南](./best-practices.md)
