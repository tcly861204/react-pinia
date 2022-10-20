import { defineStore } from '../packages/main'

const useStore = defineStore({
  state: () => {
    return {
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
    },
    changeUser() {
      this.user = 'zhangsan'
    },
  },
})

// const useStore = defineStore('app', {
//   state: () => {
//     return {
//       count: 1,
//       user: 'hello',
//     }
//   },
//   getters: {
//     doubleCount: (state: Record<string, any>) => {
//       return state.count * 2
//     },
//   },
//   actions: {
//     add() {
//       this.count += 1
//     },
//   },
// })

export default useStore
