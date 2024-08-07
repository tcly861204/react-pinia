import { defineStore } from '../packages/main'

const useStore = defineStore({
  state: () => {
    return {
      a: 1,
      b: 2,
      count: 1,
      user: 'hello'
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
      this.user = 'zhangsan'
    },
  },
  persist: {
    key: 'home'
  }
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
