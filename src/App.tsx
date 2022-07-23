import { memo } from 'react'
import useStore from './useStore'
import Child from './Child'
import { useState } from '../packages/main'

const Child2 = memo(() => {
  const { home } = useState('home')
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
  const { about } = useState('about')
  console.log('rendeirng child3')
  return (
    <section>
      <p>{about.num}</p>
      <button onClick={() => (about.num += 1)}>修改</button>
    </section>
  )
})

const App = () => {
  return (
    <section>
      <Child />
      <Child2 />
      <Child3 />
    </section>
  )
}

export default App
