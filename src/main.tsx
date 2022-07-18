import ReactDOM from 'react-dom'
import { Provider } from '../packages/main'
import store from './store/index'
import App from './App'
let root = document.querySelector('#root')

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)
