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
  console.log('rending')
  return (
    <section>
      <p>hello app</p>
      <p>name: {user.name}</p>
      <input
        value={user.name}
        onChange={(e) => {
          user.name = e.target.value
        }}
        onKeyDown={(e) => {
          if (e.code === 'Enter') {
            user.list.push({
              id: Math.random(),
              name: user.name,
            })
            user.name = ''
          }
        }}
      />
      {user.list.map((item: { id: number; name: string }) => {
        return <li key={item.id}>{item.name}</li>
      })}
      <Child />
      <Child2 />
    </section>
  )
}

export default App
