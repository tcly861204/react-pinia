import { BrowserRouter } from 'react-router-dom'
import routes from './router/index'
const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {routes()}
    </BrowserRouter>
  )
}
export default App
