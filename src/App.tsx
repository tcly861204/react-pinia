import { memo, useEffect } from 'react'
import Child from './Child'
import { useStore, defineStore } from '../packages/main'
const Child2 = memo(() => {
  const home = useStore('home')
  const about = useStore('about')
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
  const about = useStore('about')
  console.log('rendeirng child3')
  return (
    <section>
      <p>about: {about.num}</p>
      <button onClick={() => (about.num += 1)}>修改</button>
    </section>
  )
})

const useChildStore = defineStore({
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

const Child4 = () => {
  const { count, user, add } = useChildStore()
  console.log('rendering child4')
  return (
    <section>
      <p>child4: {count}</p>
      <p>user: {user}</p>
      <button onClick={add}>添加</button>
    </section>
  )
}

const App = () => {
  return (
    <section>
      <Child2 />
      {/* <Child /> */}
      {/* <Child2 />
      <Child3 />
      <Child4 /> */}
    </section>
  )
}

export default App
