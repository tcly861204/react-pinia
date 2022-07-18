# react-pinia

🍍 构建 react 极简状态管理

## 安装

> npm i react-pinia

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

import { Provider } from 'react-pinia'
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

import { createStore } from 'react-pinia'

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
