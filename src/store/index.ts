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
      doubleCount: (state) => {
        return state.count * 2
      },
    },
    actions: {
      add(count, sum) {
        console.log(sum)
        this.count += count
      },
    }
  },
})

export default store
