import { defineStore } from '../packages/main'

const useStore = defineStore('app', {
  state: () => {
    return {
      count: 1,
      user: 'hello',
    }
  },
  getters: {
    doubleCount: (state: Record<string, any>) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      console.log(this)
      this.count += 1
    },
  },
})

export default useStore