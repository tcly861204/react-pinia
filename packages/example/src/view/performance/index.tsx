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
      <h3>Count Component</h3>
      <p>Count: {count}</p>
      <p>Render Count: {renderCount.current}</p>
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
      <h3>User Component</h3>
      <p>User: {user}</p>
      <p>Render Count: {renderCount.current}</p>
    </div>
  )
}

const Controls = () => {
  const store = useStore<State, 'home'>('home')
  
  return (
    <div style={{ border: '1px solid red', padding: '10px', margin: '10px' }}>
      <h3>Controls</h3>
      <button onClick={() => store && store.count++}>Increment Count</button>
      <button onClick={() => store && (store.user = 'User ' + Math.random().toFixed(2))}>Change User</button>
    </div>
  )
}

const PerformanceDemo = () => {
  return (
    <div>
      <h2>Performance Demo</h2>
      <p>Verify that updating Count does not re-render User Component, and vice versa.</p>
      <div style={{ display: 'flex' }}>
        <CountComponent />
        <UserComponent />
      </div>
      <Controls />
    </div>
  )
}

export default PerformanceDemo
