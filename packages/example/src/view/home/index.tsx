import Child from './Child'
import useStore from './useStore'
const Home = () => {
  const store = useStore()
  return (
    <section>
      <fieldset>
        <legend>父组件</legend>
        <div>
          <p>count: {store.count}</p>
          <p>doubleCount: {store.doubleCount}</p>
          <button onClick={() => store.add()}>add</button>
        </div>
      </fieldset>
      <fieldset>
        <legend>子组件</legend>
        <div>
          <Child />
        </div>
      </fieldset>
    </section>
  )
}

export default Home
