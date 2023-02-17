# react-pinia

🍍 构建 react 极简状态管理

<a href="https://npmjs.com/package/react-pinia" target="_blank"><img src="https://badgen.net/npm/v/react-pinia" alt="npm package"></a>

## 安装

> npm i react-pinia

## 全局使用

定义数据源

```ts
import { createStore, createStoreOption } from 'react-pinia'

const home: createStoreOption = {
  state: () => {
    return {
      count: 1,
      user: 'hello world',
    }
  },
  getters: {
    doubleCount: (state) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      this.count += 1
      console.log(this)
    },
  },
  // 是否持久化数据
  persist: {
    key: 'home',
    storage: 'localStorage' // 'localStorage' | 'sessionStorage' 默认使用localStorage
  }
}

const about: createStoreOption = {
  state: () => {
    return {
      num: 1,
    }
  },
}

const store = createStore({
  home,
  about,
})

export default store
```

全局挂载

```ts
import { Provider } from 'react-pinia'
import store from '@/store'
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)
```

全局使用

```ts
import { useStore } from 'react-pinia'
const App = memo(() => {
  const home = useStore('home')
  return (
    <section>
      <p>count: {home.count}</p>
      <p>doubleCount: {home.doubleCount}</p>
      <p>{home.user}</p>
      <button onClick={home.add}>累加</button>
    </section>
  )
})
export default App
```

## 局部使用

局部使用不需要全局挂载，直接使用即可

```ts
// 定义数据源
import { defineStore } from 'react-pinia'
const useStore = defineStore({
  state: () => {
    return {
      count: 1,
      user: 'hello',
    }
  },
  getters: {
    doubleCount: (state) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      this.count += 1
    },
  },
  // 是否持久化数据
  persist: {
    key: 'user',
    storage?: 'localStorage' // 'localStorage' | 'sessionStorage' 默认使用localStorage
  }
})
```

```ts
// 使用数据源
import { memo } from 'react'
import useStore from './useStore'
const Child = memo(() => {
  const { count, doubleCount, add } = useStore('count')
  return (
    <section>
      <p>{count}</p>
      <p>{doubleCount}</p>
      <button onClick={add}>累加</button>
    </section>
  )
})
export default Child
```

## 赞助 | Sponsored

开源不易, 有了您的赞助, 我们会做的更好 👋

<img style="display: block;" src="https://github.com/tcly861204/tcly861204/blob/HEAD/wepay.jpg" width="180px" />

## 技术反馈和交流群 | Technical feedback and communication

微信：cobill2008

## License

[MIT](http://opensource.org/licenses/MIT)
