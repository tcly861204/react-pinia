import { createStore } from '../../packages/main'
const store = createStore({
  home: {
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
        this.count += 1
        console.log(this)
      },
    },
  },
  about: {
    state: () => {
      return {
        num: 1,
        hello: 'abc',
      }
    },
  },
})

export default store
