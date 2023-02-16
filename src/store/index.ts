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
      add(count, sum) {
        console.log(sum)
        this.count += count
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
