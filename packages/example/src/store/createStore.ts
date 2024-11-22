import { createStore } from 'react-pinia'

export type HomeState = {
  count: number
  user: string
  info: {
    useName: string
    password: string
  }
  getters: {
    doubleCount: number
  }
  actions: {
    add: (count: number) => void
  }
}
export type AboutState = {
  num: number
}

export interface State {
  home: HomeState
  about: AboutState
}
const store = createStore<State>({
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
        console.log(this.info)
        // this.count += count
        // this.info.useName = 'cobill'
        this.info = {
          useName: 'cobill',
          password: '123456789',
        }
        // this.user = 'world'
      },
    },
    deep: false,
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
