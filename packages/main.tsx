import { useRef, createContext, useContext } from 'react'
import { useCreation } from './hooks/index'
export * from './defineStore'
import { defineStore, createStoreOption } from './defineStore'

const Context = createContext({})
const globalStoreCache: Record<string, any> = {}

export const Provider = ({
  store,
  children,
}: {
  store: Record<string, Record<string, any>>
  children?: React.ReactNode
}): JSX.Element => {
  const stateRef = useRef(store)
  const state = useCreation(() => {
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const createStore = (options: Record<string, createStoreOption>) => {
  Object.keys(options).map((key) => {
    globalStoreCache[key] = defineStore(options[key])
  })
  return globalStoreCache
}

export const useStore = (globalKey: string, storeKey?: string | Array<string>) => {
  const store = useContext(Context) as Record<
    string,
    (storeKey?: string | Array<string>) => Record<string, any>
  >
  return store[globalKey](storeKey)
}

export * from './version'
