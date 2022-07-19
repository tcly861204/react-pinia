import { memo } from 'react'
import useStore from './useStore'
import Child from './Child'

const Child2 = memo(() => {
  const store = useStore('user')
  console.log('rending app')
  return (
    <section>
      <p>{store.user}</p>
      <button onClick={() => (store.user = 'avc')}>修改</button>
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
