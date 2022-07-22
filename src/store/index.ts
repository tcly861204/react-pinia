import { createStore } from '../../packages/main'
const store = createStore({
  home: {
    state: () => {
      return {
        count: 1,
        user: 'hello',
      }
    },
  },
  about: {
    state: () => {
      return {
        num: 1,
      }
    },
  },
})

export default store
