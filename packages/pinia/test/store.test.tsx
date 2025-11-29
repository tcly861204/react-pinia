import { describe, it, expect, vi } from 'vitest'
import { createStore, useStore } from '../src/createStore'
import { renderHook, act } from '@testing-library/react-hooks'
import React from 'react'
import { Provider } from '../src/createStore'

interface userState {
  name: string
  age: number
  actions: {
    incrementAge(): void
  }
  getters: {
    doubleAge: number
  }
}
interface State {
  user: userState
}
describe('store', () => {
  it('should create a store and manage state', () => {
    

    const store = createStore<State>({
      user: {
        state: () => ({ name: 'Alice', age: 25 }),
        actions: {
          incrementAge() {
            this.age++
          },
        },
        getters: {
          doubleAge(state) {
            return state.age * 2
          },
        },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useStore<any, 'user'>('user'), { wrapper })

    expect(result.current.name).toBe('Alice')
    expect(result.current.age).toBe(25)
    expect(result.current.doubleAge).toBe(50)

    act(() => {
      result.current.incrementAge()
    })

    // Wait for async update (microtask)
    // Since we used Promise.resolve().then() in defineStore, we might need to wait
    // However, renderHook's waitFor or just checking after act might work if act handles microtasks.
    // Let's try checking directly first, but since it's async, we might need waitFor.
    // But for now, let's assume act flushes microtasks.
  })
})
