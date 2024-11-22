import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from 'react-pinia'
import store from './store/createStore'
let root = document.querySelector('#root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)
