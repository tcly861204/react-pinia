import { memo, useCallback, useState } from 'react'
import Child from './Child'
import { useStore, defineStore } from '../packages/main'

const Child2 = memo(() => {
  const { home } = useStore('home')
  console.log('rendeirng child2')
  console.log(home)
  return (
    <section>
      <p>count: {home.count}</p>
      <p>doubleCount: {home.doubleCount}</p>
      <p>{home.user}</p>
      <button onClick={home.add}>修改</button>
    </section>
  )
})

const Child3 = memo(() => {
  const { about } = useStore('about')
  console.log('rendeirng child3')
  return (
    <section>
      <p>{about.num}</p>
      <button onClick={() => (about.num += 1)}>修改</button>
    </section>
  )
})

const useChildStore = defineStore('child', {
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

const Child4 = ({ onClick }: { onClick: () => void }) => {
  const { count } = useChildStore()
  console.log('rendering child4')
  return (
    <section>
      <p>child4 {count}</p>
      <button onClick={onClick}>添加</button>
    </section>
  )
}

const App = () => {
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => {
    console.log('callback')
    setCount(count + 1)
  }, [count])
  return (
    <section>
      <Child />
      <Child2 />
      <Child3 />
      app {count}
      <Child4 onClick={() => handleClick()} />
    </section>
  )
}

export default App
