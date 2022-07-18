# react-pinia
构建react极简状态管理

## store的定义
```js
// store/index.(ts|js)

export default {
  user: {
    username: '',
    password: ''
  },
  article: {
    loading: false,
    list: []
  }
}

```

## 入口引入store
```js
// main.(tsx?|jsx)

import { Provider } from 'react-pinia';
import store from '@/store'
export default () => {
  return <Provider store={store}>
    <App />
  </Provider>
}

```

```js
// page.(tsx?|jsx)

import { createStore } from 'react-pinia';

export default () => {
  const { user } = createStore('user')
  return <section>
    <input
      value={user.username}
      onChange={(e) => {
        user.username = e.target.value;
      }}
    />
    {user.username}
  </section>
}

```