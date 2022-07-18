import { useCreation, useUpdate } from 'ahooks'
import { useEffect, useRef, createContext, useContext } from 'react'
import { typeOf, observer } from './util'
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
  const update = useUpdate()
  const stateRef = useRef(store)
  const state = useCreation(() => {
    const callback = (key: string) => {
      update()
      bus.emit('update', key)
    }
    Object.keys(stateRef.current).map((key) => {
      stateRef.current[key] = observer(key, stateRef.current[key], callback)
    })
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const createStore = (
  storeKey?: string | Array<string>
): Record<string, Record<string, any>> => {
  const update = useUpdate()
  const store = useContext(Context)
  useEffect(() => {
    if (storeKey && (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array')) {
      const _update = (key: unknown) => {
        if (
          (typeOf(storeKey) === 'string' && storeKey === key) ||
          (typeOf(storeKey) === 'array' && storeKey.includes(key as string))
        ) {
          update()
        }
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
  options: Record<'state', any>
): (() => Record<string, any>) => {
  const callback = () => {
    bus.emit('local', id)
  }
  _storeCache[id] = observer(id, options.state(), callback)
  return () => {
    const update = useUpdate()
    const store = _storeCache[id]
    useEffect(() => {
      bus.on('local', update)
      return () => {
        bus.off('local')
      }
    }, [])
    return store
  }
}
