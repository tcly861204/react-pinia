# 使用示例

本页面展示了 React-Pinia 的各种使用场景和示例代码。

## 基础示例

### 简单计数器

最简单的状态管理示例：

```typescript
import { createStore, Provider, useStore } from 'react-pinia'

// 1. 定义类型
interface CounterState {
  count: number
  actions: {
    increment(): void
    decrement(): void
    reset(): void
  }
  getters: {
    doubleCount: number
  }
}

interface State {
  counter: CounterState
}

// 2. 创建 store
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
      reset() {
        this.count = 0
      },
    },
    getters: {
      doubleCount(state) {
        return state.count * 2
      },
    },
  },
})

// 3. 使用组件
function Counter() {
  const counter = useStore<State, 'counter'>('counter')

  return (
    <div>
      <h2>计数器示例</h2>
      <p>当前值: {counter?.count}</p>
      <p>双倍值: {counter?.doubleCount}</p>
      <button onClick={() => counter?.increment()}>+1</button>
      <button onClick={() => counter?.decrement()}>-1</button>
      <button onClick={() => counter?.reset()}>重置</button>
    </div>
  )
}

// 4. App 组件
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

## 实际应用示例

### 用户认证

完整的用户认证流程示例：

```typescript
interface UserState {
  user: {
    id: number
    name: string
    email: string
  } | null
  token: string | null
  loading: boolean
  error: string | null
  actions: {
    login(email: string, password: string): Promise<void>
    logout(): void
    fetchProfile(): Promise<void>
  }
  getters: {
    isAuthenticated: boolean
    userName: string
  }
}

interface State {
  user: UserState
}

const store = createStore<State>({
  user: {
    state: () => ({
      user: null,
      token: null,
      loading: false,
      error: null,
    }),
    actions: {
      async login(email: string, password: string) {
        this.loading = true
        this.error = null
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await response.json()
          this.user = data.user
          this.token = data.token
        } catch (error: any) {
          this.error = error.message
        } finally {
          this.loading = false
        }
      },
      logout() {
        this.user = null
        this.token = null
      },
      async fetchProfile() {
        if (!this.token) return
        const response = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = await response.json()
      },
    },
    getters: {
      isAuthenticated(state) {
        return !!state.token
      },
      userName(state) {
        return state.user?.name || '游客'
      },
    },
    // 持久化 token
    persist: {
      key: 'auth-token',
      storage: 'localStorage',
    },
  },
})

// 登录组件
function LoginForm() {
  const user = useStore<State, 'user'>('user')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await user?.login(email, password)
  }

  if (user?.isAuthenticated) {
    return <div>欢迎, {user.userName}!</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit" disabled={user?.loading}>
        {user?.loading ? '登录中...' : '登录'}
      </button>
      {user?.error && <p style={{ color: 'red' }}>{user.error}</p>}
    </form>
  )
}
```

### 待办事项列表

包含增删改查的完整示例：

```typescript
interface Todo {
  id: number
  text: string
  done: boolean
}

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  actions: {
    addTodo(text: string): void
    toggleTodo(id: number): void
    removeTodo(id: number): void
    setFilter(filter: 'all' | 'active' | 'completed'): void
    clearCompleted(): void
  }
  getters: {
    filteredTodos: Todo[]
    activeCount: number
    completedCount: number
  }
}

interface State {
  todo: TodoState
}

const store = createStore<State>({
  todo: {
    state: () => ({
      todos: [],
      filter: 'all' as const,
    }),
    actions: {
      addTodo(text: string) {
        this.todos.push({
          id: Date.now(),
          text,
          done: false,
        })
      },
      toggleTodo(id: number) {
        const todo = this.todos.find((t) => t.id === id)
        if (todo) {
          todo.done = !todo.done
        }
      },
      removeTodo(id: number) {
        this.todos = this.todos.filter((t) => t.id !== id)
      },
      setFilter(filter: 'all' | 'active' | 'completed') {
        this.filter = filter
      },
      clearCompleted() {
        this.todos = this.todos.filter((t) => !t.done)
      },
    },
    getters: {
      filteredTodos(state) {
        if (state.filter === 'active') {
          return state.todos.filter((t) => !t.done)
        }
        if (state.filter === 'completed') {
          return state.todos.filter((t) => t.done)
        }
        return state.todos
      },
      activeCount(state) {
        return state.todos.filter((t) => !t.done).length
      },
      completedCount(state) {
        return state.todos.filter((t) => t.done).length
      },
    },
    persist: {
      key: 'todos',
      storage: 'localStorage',
    },
  },
})

// TodoList 组件
function TodoList() {
  const todo = useStore<State, 'todo'>('todo')
  const [input, setInput] = React.useState('')

  const handleAdd = () => {
    if (input.trim()) {
      todo?.addTodo(input)
      setInput('')
    }
  }

  return (
    <div>
      <h2>待办事项</h2>
      
      {/* 输入框 */}
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加新任务..."
        />
        <button onClick={handleAdd}>添加</button>
      </div>

      {/* 过滤器 */}
      <div>
        <button onClick={() => todo?.setFilter('all')}>全部</button>
        <button onClick={() => todo?.setFilter('active')}>
          未完成 ({todo?.activeCount})
        </button>
        <button onClick={() => todo?.setFilter('completed')}>
          已完成 ({todo?.completedCount})
        </button>
      </div>

      {/* 列表 */}
      <ul>
        {todo?.filteredTodos.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => todo?.toggleTodo(item.id)}
            />
            <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
              {item.text}
            </span>
            <button onClick={() => todo?.removeTodo(item.id)}>删除</button>
          </li>
        ))}
      </ul>

      {/* 清除已完成 */}
      {todo && todo.completedCount > 0 && (
        <button onClick={() => todo.clearCompleted()}>
          清除已完成
        </button>
      )}
    </div>
  )
}
```

## 性能优化示例

### 使用 Selector

只订阅需要的状态，避免不必要的重渲染：

```typescript
// ❌ 不好：整个组件会在任何状态变化时重渲染
function UserProfile() {
  const user = useStore<State, 'user'>('user')
  return <div>{user?.name}</div>
}

// ✅ 好：只在 name 变化时重渲染
function UserProfile() {
  const name = useStore<State, 'user', string>(
    'user',
    (state) => state.name
  )
  return <div>{name}</div>
}
```

### 拆分组件

将大组件拆分为小组件，每个组件只订阅需要的状态：

```typescript
// 用户名组件 - 只订阅 name
function UserName() {
  const name = useStore<State, 'user', string>(
    'user',
    (state) => state.name
  )
  return <h1>{name}</h1>
}

// 用户邮箱组件 - 只订阅 email
function UserEmail() {
  const email = useStore<State, 'user', string>(
    'user',
    (state) => state.email
  )
  return <p>{email}</p>
}

// 父组件
function UserProfile() {
  return (
    <div>
      <UserName />
      <UserEmail />
    </div>
  )
}
```

## 多 Store 示例

管理多个独立的状态模块：

```typescript
interface GlobalState {
  user: UserState
  cart: CartState
  settings: SettingsState
}

const store = createStore<GlobalState>({
  user: {
    state: () => ({
      name: '',
      email: '',
    }),
    // ...
  },
  cart: {
    state: () => ({
      items: [],
      total: 0,
    }),
    actions: {
      addItem(item: any) {
        this.items.push(item)
        this.total += item.price
      },
    },
    // ...
  },
  settings: {
    state: () => ({
      theme: 'light',
      language: 'zh-CN',
    }),
    actions: {
      toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light'
      },
    },
    persist: {
      key: 'app-settings',
      storage: 'localStorage',
    },
  },
})
```

## TypeScript 高级用法

### 严格类型推导

```typescript
// 定义精确的类型
interface UserState {
  name: string
  age: number
  actions: {
    setName(name: string): void
    setAge(age: number): void
  }
  getters: {
    displayName: string
    isAdult: boolean
  }
}

// TypeScript 会自动推导所有类型
const user = useStore<State, 'user'>('user')
user?.setName('Alice') // ✅ 类型正确
user?.setAge(25)       // ✅ 类型正确
user?.setAge('25')     // ❌ 类型错误
```

### 复用类型定义

```typescript
// 定义可复用的 action 类型
type CRUDActions<T> = {
  create(item: T): void
  update(id: number, item: Partial<T>): void
  delete(id: number): void
}

interface TodoState {
  items: Todo[]
  actions: CRUDActions<Todo> & {
    toggleDone(id: number): void
  }
}
```

## 调试技巧

### 在控制台查看状态

```typescript
// 在浏览器控制台
window.store = store

// 查看状态
store.user.get()

// 修改状态（用于测试）
store.user.get().name = 'Test User'
```

### 添加日志

```typescript
actions: {
  increment() {
    console.log('Before:', this.count)
    this.count++
    console.log('After:', this.count)
  }
}
```

## 更多示例

查看 [GitHub 仓库](https://github.com/tcly861204/react-pinia) 获取更多示例和完整的示例应用。
