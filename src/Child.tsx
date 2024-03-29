import useStore from './useStore'
import { memo } from 'react'
const Child = memo(() => {
  const store = useStore()
  console.log('rendering child')
  return (
    <section>
      <p>{store.count}</p>
      <p>{store.user}</p>
      <p>{store.doubleCount}</p>
      <button onClick={store.add}>添加</button>
      <button onClick={store.changeUser}>修改</button>
    </section>
  )
})

export default Child
