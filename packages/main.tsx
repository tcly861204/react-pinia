import { useCreation, useUpdate } from 'ahooks'
import { useEffect, useRef, createContext, useContext } from 'react'
import { typeOf, observer } from './util'
import bus from './bus'
const Context = createContext({})
const _storeCache: Record<string, any> = {}
const _globalStoreCache: Record<string, any> = {}

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
        Object.keys(store[key].getters!).map(sub => {
          __store[key][sub] = store[key].getters![sub](JSON.parse(JSON.stringify(__store[key])))
        })
        _globalStoreCache[key] = store[key].getters
      } catch (_) {
      }
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

const updateGetters = (key: string, store: Record<string, Record<string, any>>) => {
  if ((key) in _globalStoreCache) {
    Object.keys(_globalStoreCache[key]).map(sub => {
      store[key][sub] = _globalStoreCache[key][sub](JSON.parse(JSON.stringify(store[key])))
    })
  }
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

export const defineStore = (
  id: string,
  options: {
    state: () => Record<string, any>
    actions?: Record<string, any>
    getters?: Record<string, any>
  }
): ((storeKey?: string | Array<string>) => Record<string, any>) => {
  const state = JSON.parse(JSON.stringify(options.state()))
  let otherKeys: string[] = []
  const __store = observer(null, Object.assign({}, options.state()), callback)
  function callback(_id: string) {
    bus.emit('local', _id)
  }
  _storeCache[id] = __store
  if (options.actions) {
    otherKeys = otherKeys.concat(Object.keys(options.actions))
    try {
      Object.keys(options.actions).map((key) => {
        _storeCache[id][key] = options.actions && options.actions[key].bind(__store)
      })
    } catch (_) {}
  }
  const updateGetters = (store: Record<string, any>) => {
    if (options.getters) {
      otherKeys = otherKeys.concat(Object.keys(options.getters))
      try {
        Object.keys(options.getters).map((key) => {
          __store[key] = options.getters && options.getters[key](store)
        })
      } catch (_) {}
    }
  }
  updateGetters(state)
  return (storeKey?: string | Array<string>) => {
    const update = useUpdate()
    const store = __store
    useEffect(() => {
      bus.on('local', (_storeKey) => {
        if (!otherKeys.includes(_storeKey as string)) {
          if (storeKey && (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array')) {
            if (
              (typeOf(storeKey) === 'string' && storeKey === _storeKey) ||
              (typeOf(storeKey) === 'array' && storeKey.includes(_storeKey as string))
            ) {
              updateGetters(JSON.parse(JSON.stringify(__store)))
              update()
            }
          } else {
            updateGetters(JSON.parse(JSON.stringify(__store)))
            update()
          }
        }
      })
      return () => {
        bus.off('local')
      }
    }, [])
    return store
  }
}
