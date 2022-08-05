import { useEffect, useRef, createContext, useContext } from 'react'
import { useCreation, useUpdate } from './hooks/index'
import { typeOf, observer } from './util'
import mitt from 'mitt'
import Vs from './version'

const bus = mitt()
const Context = createContext({})
const _globalStoreCache: Record<string, any> = {}
const updateGetters = (key: string, store: Record<string, Record<string, any>>) => {
  if (key in _globalStoreCache) {
    Object.keys(_globalStoreCache[key]).map((sub) => {
      store[key][sub] = _globalStoreCache[key][sub](JSON.parse(JSON.stringify(store[key])))
    })
  }
}

export const version = Vs

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

export const createStore = (
  store: Record<
    string,
    {
      state: () => Record<string, any>
      actions?: Record<string, any>
      getters?: Record<string, any>
    }
  >
): Record<string, any> => {
  const __store: Record<string, any> = {}
  const stateCache: Record<string, string[]> = {}
  const callback = (key: string, storeKey: string | null) => {
    if (storeKey && stateCache[storeKey].includes(key)) {
      bus.emit('global', storeKey)
    }
  }
  Object.keys(store).map((key) => {
    const state = store[key].state()
    stateCache[key] = Object.keys(state)
    __store[key] = observer(key, state, callback)
    if (store[key].getters) {
      try {
        Object.keys(store[key].getters!).map((sub) => {
          __store[key][sub] = store[key].getters![sub](JSON.parse(JSON.stringify(__store[key])))
        })
        _globalStoreCache[key] = store[key].getters
      } catch (_) {}
    }
    if (store[key].actions) {
      try {
        Object.keys(store[key].actions!).map((sub) => {
          __store[key][sub] = store[key].actions![sub].bind(__store[key])
        })
      } catch (_) {}
    }
  })
  return __store
}

export const useStore = (
  storeKey?: string | Array<string>
): Record<string, Record<string, any>> => {
  const update = useUpdate()
  const store = useContext(Context) as Record<string, Record<string, any>>
  useEffect(() => {
    bus.on('global', (key: unknown) => {
      if (storeKey && (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array')) {
        if (
          (typeOf(storeKey) === 'string' && storeKey === key) ||
          (typeOf(storeKey) === 'array' && storeKey.includes(key as string))
        ) {
          updateGetters(key as string, store)
          update()
        }
      } else {
        updateGetters(key as string, store)
        update()
      }
    })
    return () => {
      bus.off('global', update)
    }
  }, [])
  return store
}

export * from './defineStore'
