import { memo } from 'react'
import { createStore } from '../packages/main'
import useStore from './useStore'
import Child from './Child'

const Child2 = memo(() => {
  const store = useStore()
  console.log('rendering child2')
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
