import { useRef, createContext, useContext } from 'react'
import { useCreation } from './hooks/index'
export * from './defineStore'
import { defineStore, createStoreOption } from './defineStore'

const Context = createContext({})
const globalStoreCache: {
  [key: keyof ReturnType<typeof createStore>]: unknown
} = {}

export interface ProviderProps {
  store: ReturnType <typeof createStore>
  children: React.ReactNode
}
/**
 * Provider
 * @param ProviderProps
 * @returns JSX.Element
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const Provider = ({ store, children }: ProviderProps): JSX.Element => {
  const stateRef = useRef(store)
  const state = useCreation(() => {
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}
/**
 * defineModel
 * @param createStoreOption
 * @returns createStoreOption
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const defineModel = <T extends Record<string, any>>(options: createStoreOption<T>): createStoreOption<T> => {
  return options
}
/**
 * createStore<T extends {[K in keyof T]: T[K]}>
 * @param options {
    [K in keyof T]: createStoreOption<T[K]>
  }
 * @returns {
      [K in keyof T]: T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
    }
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const createStore = <T extends {[K in keyof T]: T[K]}>(options: {
  [K in keyof T]: createStoreOption<T[K]>
}): {
  [K in keyof T]: T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
} => {
  Object.keys(options).forEach(key => {
    if (!(key in globalStoreCache)) {
      globalStoreCache[key] = defineStore(options[key as keyof T])
    }
  })
  return globalStoreCache as {
    [K in keyof T]: T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
  }
}

/**
 * useStore<T extends {[K in keyof T]: T[K]}, K extends keyof T>
 * @param globalKey: K
 * @param storeKey?: string | Array<string>
 * @returns T[K] extends { getters: infer G, actions: infer A } ? Omit<T[K], 'getters' | 'actions'> & G & A : Omit<T[K], 'getters' | 'actions'>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const useStore = <T extends {[K in keyof T]: T[K]}, K extends keyof T>(
    globalKey: K,
    storeKey?: string | Array<string>
  ) => {
  type State = T[K]
  const store = useContext(Context) as {
    [K in keyof T]: (storeKey?: string | Array<string>) => State extends { getters: infer G, actions: infer A } ? Omit<State, 'getters' | 'actions'> & G & A : Omit<State, 'getters' | 'actions'>
  }
  return store[globalKey](storeKey)
}

export * from './version'
