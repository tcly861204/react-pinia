import useStore from './store/useStore'
import { memo } from 'react'
const Child = memo(() => {
  const store = useStore()
  console.log(store.doubleCount)
  console.log('rendering child')
  return (
    <section>
      <p><strong>count</strong>: {store.count}</p>
      <p><strong>A</strong>: {store.a}</p>
      <p><strong>B</strong>: {store.b}</p>
      <p>{store.user}</p>
      <p>{store.doubleCount}</p>
      <button onClick={store.add}>添加</button>
      <button onClick={store.changeUser}>修改</button>
    </section>
  )
})

export default Child
