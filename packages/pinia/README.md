# react-pinia

🍍 构建 react 极简状态管理

<a href="https://npmjs.com/package/react-pinia" target="_blank"><img src="https://badgen.net/npm/v/react-pinia?v=2.7.2.1732330106209" alt="npm package"></a>

## 安装

> npm i react-pinia

## 全局使用

定义数据源

```ts
import { createStore } from 'react-pinia'
type HomeState = {
  count: number
  user: string
  info: {
    useName: string
    password: string
  }
  getters: {
    doubleCount: number
  }
  actions: {
    add: (count: number) => void
  }
}
type AboutState = {
  num: number
}

export interface State {
  home: HomeState
  about: AboutState
}
const store = createStore<State>({
  home: {
    state: () => {
      return {
        count: 1,
        user: 'hello',
        info: {
          useName: 'admin',
          password: '123456',
        },
      }
    },
    getters: {
      doubleCount: (state) => {
        return state.count * 2
      },
    },
    actions: {
      add(count) {
        console.log(this.info)
        // this.count += count
        // this.info.useName = 'cobill'
        this.info = {
          useName: 'cobill',
          password: '123456789',
        }
        // this.user = 'world'
      },
    },
    deep: false,
  },
  about: {
    state: () => {
      return {
        num: 1,
      }
    },
  },
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
// 导入全局定义的类型
import { State } from '@/store/global'
const App = memo(() => {
  const home = useStore<State, 'home'>('home')! // 这里需要传入泛型，并且断言
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

type State = {
  count: number
  user: string
  getters: {
    doubleCount: number
  }
  actions: {
    add: () => void
  }
}

const useStore = defineStore<State>({
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
    storage: 'localStorage', // 'localStorage' | 'sessionStorage' 默认使用localStorage
  },
  deet: true,
})
```

```ts
// 使用数据源
import { memo } from 'react'
import useStore from './useStore'

// 外部直接使用
const state = useStore().get()

const Child = memo(() => {
  const { count, doubleCount, add } = useStore()
  const onClick = () => {
    state.count = state.count + 1
  }
  return (
    <section>
      <p>{count}</p>
      <p>{doubleCount}</p>
      <button onClick={add}>累加</button>
      <button onClick={onClick}>外部修改</button>
    </section>
  )
})
export default Child
```

## 赞助 | Sponsored

开源不易, 有了您的赞助, 我们会做的更好 👋

<img style="display: block;" src="https://tcly861204.github.io/static/wepay.jpg" width="240px" />

## 技术反馈和交流群 | Technical feedback and communication

微信：cobill2008

## License

[MIT](http://opensource.org/licenses/MIT)
