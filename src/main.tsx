import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from '../packages/main'
import store from './store'
let root = document.querySelector('#root')

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)
