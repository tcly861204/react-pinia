import useStore, { add } from './useStore'
import { memo } from 'react'
const Child = memo(() => {
  const store = useStore()
  return (
    <section>
      <p>{store.count}</p>
      <button onClick={() => add(store)}>添加</button>
    </section>
  )
})

export default Child
