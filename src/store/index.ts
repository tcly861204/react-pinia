import { createStore } from '../../packages/main'
const store = createStore({
  home: {
    state: () => {
      return {
        count: 1,
        user: 'hello',
        info: {
          useName: 'admin',
          password: '123456',
        },
      }
    },
    getters: {
      doubleCount: (state) => {
        return state.count * 2
      },
    },
    actions: {
      add(count) {
        // console.log(this.info)
        // this.count += count
        // this.info.useName = 'cobill'
        this.info = {
          useName: 'cobill',
          password: '123456789',
        }
        // this.user = 'world'
      },
    },
    deep: false
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
