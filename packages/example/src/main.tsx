import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from 'react-pinia'
import store from './store/global'
import './styles/base.css'
const root = document.querySelector('#root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
)
