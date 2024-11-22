import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from '../pinia/main'
import store from './store/createStore'
let root = document.querySelector('#root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)

// import ReactDOM from 'react-dom'
// import { defineStore } from '../pinia/main'
// const root = document.querySelector('#root')
// const useStore = defineStore<{
//   count: number
//   actions: {
//     add: () => void
//   }
// }>({
//   state: () => {
//     return {
//       count: 10
//     }
//   },
//   actions: {
//     add() {
//       this.count += 1
//     }
//   }
// })

// function App() {
//   const store = useStore()
//   return <section>
//     <p>count: {store.count}</p>
//     <div>
//       <input value={store.count} onChange={store.add} />
//     </div>
//   </section>
// }
// ReactDOM.render(<App />, root)