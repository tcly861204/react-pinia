import { useStore } from 'react-pinia'
import { State } from '../../store/global'
import styles from './index.module.css'
import React from 'react'
const Global = () => {
  const store = useStore<State, 'user'>('user')!
  return (
    <section className={styles.container}>
      <div className={styles.mb10}>
        <label>用户名: </label>
        <input
          type='text'
          value={store.username || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            store.username = e.target.value
          }}
        />
      </div>
      <div className={styles.mb10}>
        <label>密码: </label>
        <input
          type='password'
          value={store.password || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            store.password = e.target.value
          }}
        />
      </div>
      <div>
        <button onClick={() => store.login()}>登 录</button>
      </div>
    </section>
  )
}
export default Global
