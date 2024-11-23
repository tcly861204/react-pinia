import { Outlet, Link } from 'react-router-dom'
import logoImg from '../assets/favicon.png'
import { useStore } from 'react-pinia'
import { State } from '../store/global'
import styles from './index.module.css'

const Layout = () => {
  const store = useStore<State, 'user'>('user')
  return (
    <section className={styles.container}>
      <section className={styles.header}>
        <img src={logoImg} />
        <h1>Pinia Example</h1>
        <nav>
          <Link to='/'>useDefine</Link>
          <Link to='/global'>useGlobal</Link>
        </nav>
        <div className='flex-1'></div>
        <div className={styles.face}>
          <img src={logoImg} />
          <p>{store?.username}</p>
        </div>
      </section>
      <section className={styles.main}>
        <Outlet />
      </section>
    </section>
  )
}

export default Layout
