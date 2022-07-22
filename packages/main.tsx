import { useCreation, useUpdate } from 'ahooks'
import { useEffect, useRef, createContext, useContext } from 'react'
import { typeOf, observer, checkUpdate } from './util'
import bus from './bus'
const Context = createContext({})
const _storeCache: Record<string, any> = {}

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
) => {
  const __store: Record<string, any> = {}
  const stateCache: Record<string, string[]> = {}
  const callback = (key: string, storeKey: string | null) => {
    if (storeKey && stateCache[storeKey].includes(key)) {
      // 只更新state里面的
      bus.emit('update', storeKey)
    }
  }
  Object.keys(store).map((key) => {
    const state = store[key].state()
    stateCache[key] = Object.keys(state)
    __store[key] = observer(key, state, callback)
  })
  return __store
}

export const useState = (
  storeKey?: string | Array<string>
): Record<string, Record<string, any>> => {
  const update = useUpdate()
  const store = useContext(Context)
  useEffect(() => {
    if (storeKey && (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array')) {
      const _update = (key: unknown) => {
        checkUpdate(storeKey, key as string, update)
      }
      bus.on('update', _update)
    } else {
      bus.on('update', update)
    }
    return () => {
      bus.off('update', update)
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
  if (options.getters) {
    otherKeys = otherKeys.concat(Object.keys(options.getters))
    try {
      Object.keys(options.getters).map((key) => {
        __store[key] = options.getters && options.getters[key](state)
      })
    } catch (_) {}
  }
  return (storeKey?: string | Array<string>) => {
    const update = useUpdate()
    const store = __store
    useEffect(() => {
      bus.on('local', (_storeKey) => {
        if (!otherKeys.includes(_storeKey as string)) {
          if (options.getters) {
            try {
              Object.keys(options.getters).map((key) => {
                __store[key] =
                  options.getters && options.getters[key](JSON.parse(JSON.stringify(__store)))
              })
            } catch (_) {}
          }
          if (storeKey && (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array')) {
            checkUpdate(storeKey, _storeKey as string, update)
          } else {
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
