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
        this.count += count
        this.info.useName = 'cobill'
        this.info.email = '356671808@qq.com'
      },
    },
    persist: {
      key: 'home',
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
