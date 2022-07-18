import { memo } from 'react'
import { createStore, defineStore } from '../packages/main'

const useStore = defineStore('app', {
  state: () => {
    return {
      count: 0,
    }
  },
})

const Child = memo(() => {
  const store = useStore()
  return (
    <section>
      <p>{store.count}</p>
      <button
        onClick={() => {
          store.count += 1
        }}
      >
        添加
      </button>
    </section>
  )
})

const Child2 = memo(() => {
  const store = useStore()
  return (
    <section>
      <p>{store.count}</p>
    </section>
  )
})

const App = () => {
  const { user } = createStore('user')
  return (
    <section>
      <p>hello app</p>
      <p>username: {user.username}</p>
      <input
        value={user.username}
        onChange={(e) => {
          user.username = e.target.value
        }}
      />
      <Child />
      <Child2 />
    </section>
  )
}

export default App
