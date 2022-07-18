# mini-quick-store

🍍 构建 react 极简状态管理

## 安装

> npm i mini-quick-store

## store 的定义

```js
// store/index.(ts|js)

export default {
  user: {
    username: '',
    password: '',
  },
  article: {
    loading: false,
    list: [],
  },
}
```

## 入口引入 store

```js
// main.(tsx?|jsx)

import { Provider } from 'mini-quick-store'
import store from '@/store'
export default () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

## 页面使用

```js
// page.(tsx?|jsx)

import { createStore } from 'mini-quick-store'

export default () => {
  const { user } = createStore('user')
  return (
    <section>
      <input
        value={user.username}
        onChange={(e) => {
          user.username = e.target.value
        }}
      />
      {user.username}
    </section>
  )
}
```

## 局部状态

```js
import { defineStore } from 'mini-quick-store'

// 定义局部状态
const useStore = defineStore('count', {
  state: () => {
    return {
      count: 0,
    }
  },
})

const Child = () => {
  const store = useStore()
  return <section>{store.count}</section>
}

const App = () => {
  const store = useStore()
  return (
    <section>
      <p>count: {store.count}</p>
      <button
        onClick={() => {
          store.count += 1
        }}
      >
        add
      </button>
      <Child />
    </section>
  )
}
```
