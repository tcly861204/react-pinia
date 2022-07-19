import useStore from './useStore'
import { memo } from 'react'
const Child = memo(() => {
  const store = useStore('count')
  console.log('rendering')
  console.log(store)
  return (
    <section>
      <p>{store.count}</p>
      <p>{store.doubleCount}</p>
      <button onClick={store.add}>添加</button>
    </section>
  )
})

export default Child
