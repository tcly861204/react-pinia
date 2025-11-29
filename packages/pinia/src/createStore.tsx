import { useRef, createContext, useContext } from 'react'
import { useCreation } from './hooks'
import { StateOption, State, Getters, Actions } from './types'
import { defineStore } from './defineStore'

interface ProviderProps {
  store: ReturnType<typeof createStore>
  children: React.ReactNode
}

const Context = createContext({})

export const Provider = ({ store, children }: ProviderProps): JSX.Element => {
  const stateRef = useRef(store)
  const state = useCreation(() => {
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const createStore = <T extends { [K in keyof T]: T[K] }>(options: {
  [K in keyof T]: StateOption<T[K]>
}) => {
  const store = Object.create(null)
  Object.keys(options).forEach((key) => {
    if (!(key in store)) {
      store[key] = defineStore(options[key as keyof T])
    }
  })
  return store as {
    [key: string]: ReturnType<typeof defineStore>
  }
}

export const useStore = <T extends { [K in keyof T]: T[K] }, K extends keyof T, S = any>(
  globalKey: K,
  selector?: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
) => {
  const store = useContext(Context) as {
    [K in keyof T]: (
      selector?: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
    ) => S
  }
  if (globalKey in store) return store[globalKey](selector)
  return null
}
