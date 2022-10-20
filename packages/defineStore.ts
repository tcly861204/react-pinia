import mitt from 'mitt'
import { useEffect } from 'react'
import { useUpdate } from './hooks/index'
import { typeOf, observer } from './utils/index'
export interface createStoreOption {
  state: () => Record<string, any>
  actions?: Record<string, (this: Record<string, any>) => any>
  getters?: Record<string, (state: Record<string, any>) => any>
}
export const defineStore = (options: createStoreOption) => {
  const bus = mitt()
  const initState = options.state()
  const actionKeys: string[] = []
  const _store = observer(null, initState, callback)
  function callback(id: string) {
    bus.emit('local', id)
  }
  const updateGetters = (store: Record<string, any>) => {
    try {
      Object.keys(options.getters!).map((key) => {
        _store[key] = options.getters && options.getters[key](store)
      })
    } catch (_) {}
  }
  if (options.actions) {
    Object.keys(options.actions).map((key) => {
      actionKeys.push(key)
      _store[key] = options.actions![key].bind(_store)
      return key
    })
  }
  updateGetters(initState)
  return (storeKey?: string | Array<string>) => {
    const update = useUpdate()
    const store = _store
    useEffect(() => {
      bus.on('local', (emitKey: unknown) => {
        if (!actionKeys.includes(emitKey as string)) {
          if (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array') {
            if (emitKey === storeKey || (storeKey as string[]).includes(emitKey as string)) {
              updateGetters(_store)
              update()
            }
          } else {
            updateGetters(_store)
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
