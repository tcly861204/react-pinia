import { defineStore } from 'react-pinia'

interface initState {
  a: number
  b: number
  count: number
  user: string
  getters: {
    doubleCount: number
  }
  actions: {
    add: () => void
    changeUser: () => void
  }
}

const useStore = defineStore<initState>({
  state: () => {
    return {
      a: 1,
      b: 2,
      count: 1,
      user: 'hello',
    }
  },
  getters: {
    doubleCount: (state) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      this.count += 1
      this.a += 2
      this.b += 3
    },
    changeUser() {
      this.user = '李四'
    },
  },
  persist: {
    key: 'home',
    storage: 'localStorage',
  },
})

export default useStore
