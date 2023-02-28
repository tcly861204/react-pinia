import { useRef, createContext, useContext } from 'react'
import { useCreation } from './hooks/index'
export * from './defineStore'
import { defineStore, createStoreOption } from './defineStore'

const Context = createContext({})
const globalStoreCache: Record<string, any> = {}

export interface ProviderProps {
  store: Record<string, Record<string, any>>
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
export const defineModel = (options: createStoreOption): createStoreOption => {
  return options
}
/**
 * createStore
 * @param Record<string, createStoreOption>
 * @returns Record<string, createStoreOption>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const createStore = (options: Record<string, createStoreOption>) => {
  Object.keys(options).map((key) => {
    globalStoreCache[key] = defineStore(options[key])
  })
  return globalStoreCache
}
/**
 * useStore
 * @param string
 * @param [string | Array<string>]
 * @returns Record<string, createStoreOption>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const useStore = (globalKey: string, storeKey?: string | Array<string>) => {
  const store = useContext(Context) as Record<
    string,
    (storeKey?: string | Array<string>) => Record<string, any>
  >
  if (globalKey in store) {
    return store[globalKey](storeKey)
  }
  return {}
}

export * from './version'
