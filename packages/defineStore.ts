import mitt from 'mitt'
import { useEffect } from 'react'
import { useUpdate } from './hooks/index'
import { typeOf, observer } from './utils/index'

const defineStoreCache: Record<string, any> = {}
export const defineStore = (
  id: string,
  options: {
    state: () => Record<string, any>
    actions?: Record<string, any>
    getters?: Record<string, any>
  }
): ((storeKey?: string | Array<string>) => Record<string, any>) => {
  const bus = mitt()
  const state = JSON.parse(JSON.stringify(options.state()))
  let otherKeys: string[] = []
  const __store = observer(null, Object.assign({}, options.state()), callback)
  function callback(_id: string) {
    bus.emit('local', _id)
  }
  defineStoreCache[id] = __store
  if (options.actions) {
    otherKeys = otherKeys.concat(Object.keys(options.actions))
    try {
      Object.keys(options.actions).map((key) => {
        defineStoreCache[id][key] = options.actions && options.actions[key].bind(__store)
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
