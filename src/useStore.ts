import { defineStore } from '../packages/main'

const useStore = defineStore('app', {
  state: () => {
    return {
      count: 1,
    }
  },
  getters: {
    dobCount: (state: Record<string, any>) => {
      return state.count * 2
    },
  },
  actions: {
    add() {
      this.count += 1
    },
  },
})

export default useStore
