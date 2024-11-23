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

export type UserState = {
  username: string | null
  password: string | null
  actions: {
    login: () => void
  }
}

export interface State {
  home: HomeState
  about: AboutState
  user: UserState
}
const store = createStore<State>({
  user: {
    state: () => {
      return {
        username: null,
        password: null,
      }
    },
    actions: {
      login() {
        const { username, password } = this
        fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        })
      },
    },
  },
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
      add(count: number) {
        console.log(this.info)
        this.count = count
        this.info = {
          useName: 'cobill',
          password: '123456789',
        }
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
