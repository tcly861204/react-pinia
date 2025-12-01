# react-pinia

🍍 Build minimal state management for React

<a href="https://npmjs.com/package/react-pinia" target="_blank"><img src="https://badgen.net/npm/v/react-pinia?v=2.7.5.1764580280903" alt="npm package"></a>

## Installation

> npm i react-pinia

## Global Usage

Define data source

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

Global Mounting

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

Global Usage

```ts
import { useStore } from 'react-pinia'
// Import globally defined types
import { State } from '@/store/global'
const App = memo(() => {
  const home = useStore<State, 'home'>('home')! // Need to pass generics and assert
  return (
    <section>
      <p>count: {home.count}</p>
      <p>doubleCount: {home.doubleCount}</p>
      <p>{home.user}</p>
      <button onClick={home.add}>Add</button>
    </section>
  )
})
export default App
```

## Local Usage

Local usage does not require global mounting, just use it directly

```ts
// Define data source
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
  // Whether to persist data
  persist: {
    key: 'user',
    storage: 'localStorage', // 'localStorage' | 'sessionStorage' default is localStorage
  },
  deet: true,
})
```

```ts
// Use data source
import { memo } from 'react'
import useStore from './useStore'

// Use directly outside
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
      <button onClick={add}>Add</button>
      <button onClick={onClick}>Modify externally</button>
    </section>
  )
})
export default Child
```

## Sponsored

Open source is not easy, with your sponsorship, we will do better 👋

<img style="display: block;" src="https://tcly861204.github.io/static/wepay.jpg" width="240px" />

## Technical feedback and communication

WeChat: cobill2008

## License

[MIT](http://opensource.org/licenses/MIT)
