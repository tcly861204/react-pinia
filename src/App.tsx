import { memo } from 'react'
import Child from './Child'
import { useStore, defineStore } from '../packages/main'
import { State } from './store/createStore'
const Child2 = memo(() => {
  const home = useStore<State, 'home'>('home')!
  const about = useStore<State, 'about'>('about')!
  console.log('rendeirng child2')
  return (
    <section>
      <p>count: {home.count}</p>
      <p>doubleCount: {home.doubleCount}</p>
      <p>num: {about.num}</p>
      <p>{home.user}</p>
      <p>info {JSON.stringify(home.info)}</p>
      <button
        onClick={() => {
          home.add(10)
        }}
      >
        修改
      </button>
    </section>
  )
})

const Child3 = memo(() => {
  const about = useStore<State, 'about'>('about')!
  console.log('rendeirng child3')
  return (
    <section>
      <p>about: {about.num}</p>
      <button onClick={() => about.num = about.num + 1}>修改</button>
    </section>
  )
})

const useChildStore = defineStore<{
  count: number
  user: string
  getters: {
    doubleCount: number
  }
  actions: {
    add: () => void
  }
}>({
  state: () => {
    return {
      count: 1,
      user: 'hello',
    }
  },
  getters: {
    doubleCount: (state: Record<string, any>) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      this.count += 1
    },
  },
})

const Child4 = memo(() => {
  const { count, user, add } = useChildStore()
  console.log('rendering child4')
  return (
    <section>
      <p>child4: {count}</p>
      <p>user: {user}</p>
      <button onClick={add}>添加</button>
    </section>
  )
})

const Child5 = memo(() => {
  const { count, user } = useChildStore()
  console.log('rendering child5')
  return (
    <section>
      <p>child5: {count}</p>
      <p>user: {user}</p>
    </section>
  )
})

const App = () => {
  return (
    <section>
      <Child />
      <Child2 />
      <Child3 />
      <Child4 />
      <Child5 />
    </section>
  )
}

export default App
