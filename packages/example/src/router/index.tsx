import { Routes, Route } from 'react-router-dom'
import Layout from '../layout'
import Home from '../view/home'
import Global from '../view/global'

const Router = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='/global' element={<Global />} />
        <Route path='/' element={<Home />} />
      </Route>
    </Routes>
  )
}

export default Router
