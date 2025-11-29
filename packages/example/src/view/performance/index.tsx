import React, { useRef } from 'react'
import { useStore } from 'react-pinia'
import { State } from '../../store/global'

const CountComponent = () => {
  const renderCount = useRef(0)
  renderCount.current++
  
  // Select only count
  const count = useStore<State, 'home', number>('home', (state) => state.count)
  
  return (
    <div style={{ border: '1px solid blue', padding: '10px', margin: '10px' }}>
      <h3>计数组件</h3>
      <p>计数: {count}</p>
      <p>渲染次数: {renderCount.current}</p>
    </div>
  )
}

const UserComponent = () => {
  const renderCount = useRef(0)
  renderCount.current++
  
  // Select only user
  const user = useStore<State, 'home', string>('home', (state) => state.user)
  
  return (
    <div style={{ border: '1px solid green', padding: '10px', margin: '10px' }}>
      <h3>用户组件</h3>
      <p>用户: {user}</p>
      <p>渲染次数: {renderCount.current}</p>
    </div>
  )
}

const Controls = () => {
  const store = useStore<State, 'home'>('home')
  
  return (
    <div style={{ border: '1px solid red', padding: '10px', margin: '10px' }}>
      <h3>控制面板</h3>
      <button onClick={() => store && store.count++}>增加计数</button>
      <button onClick={() => store && (store.user = 'User ' + Math.random().toFixed(2))}>修改用户</button>
    </div>
  )
}

const PerformanceDemo = () => {
  return (
    <div>
      <h2>性能演示</h2>
      <p>验证更新计数不会导致用户组件重新渲染，反之亦然。</p>
      <div style={{ display: 'flex' }}>
        <CountComponent />
        <UserComponent />
      </div>
      <Controls />
    </div>
  )
}

export default PerformanceDemo
