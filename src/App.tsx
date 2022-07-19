import { memo } from 'react'
import useStore from './useStore'
import Child from './Child'

const Child2 = memo(() => {
  const store = useStore()
  console.log('rendering Child2')
  return (
    <section>
      <p>{store.count}</p>
    </section>
  )
})

const App = () => {
  return (
    <section>
      <Child />
      <Child2 />
    </section>
  )
}

export default App
