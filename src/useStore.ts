import { defineStore } from '../packages/main'

const useStore = defineStore('app', {
  state: () => {
    return {
      count: 0,
    }
  },
  actions: {
    add() {
      console.log(this)
      this.count += 1
    },
  },
})

export const add = (store: Record<string, any>) => {
  store.count += 1
}

export default useStore
