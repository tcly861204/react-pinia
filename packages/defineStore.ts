import mitt from 'mitt'
import { useEffect } from 'react'
import { useUpdate } from './hooks/index'
import { typeOf, observer, getStorage, setStorage, updateState } from './utils/index'
import { type Persist } from './utils/index'

export interface createStoreOption {
  // 定义状态
  state: () => Record<string, any>
  // 修改状态
  actions?: Record<string, (this: Record<string, any>, ...args: any) => any>
  // 监听状态更新生成新的状态
  getters?: Record<string, (state: Record<string, any>) => any>,
  // 是否开启缓存持久化数据
  persist?: Persist
}
export const defineStore = (options: createStoreOption) => {
  const persist = options.persist
  const bus = mitt()
  // 读取缓存
  const initState = (persist && getStorage(persist)) || options.state()
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
              // 更新缓存
              updateState(initState, _store)
              persist && setStorage(persist, JSON.stringify(initState))
            }
          } else {
            updateGetters(_store)
            update()
            // 更新缓存
            updateState(initState, _store)
            persist && setStorage(persist, JSON.stringify(initState))
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
