import mitt from 'mitt'
import { useEffect } from 'react'
import { useUpdate } from './hooks/index'
import { typeOf, observer, getStorage, setStorage, updateState } from './utils/index'
import { type Persist } from './utils/index'
export type State<T> = Omit<T, 'actions' | 'getters'>;
export interface createStoreOption<T>{
  // 定义状态
  state: () => State<T>
  // 修改状态
  actions?: Record<string, (this: State<T>, ...args: unknown[]) => unknown>
  // 监听状态更新生成新的状态
  getters?: Record<string, (state: State<T>) => unknown>
  // 是否开启缓存持久化数据
  persist?: Persist
  deep?: boolean // 是否深度监听数据
}
/**
 * defineStore<T>
 * @param options createStoreOption<T>
 * @returns Record<string, unknown>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
export const defineStore = <T>(options: createStoreOption<T>) => {
  type GettersType = T extends { getters: infer G } ? G : {};
  type actionType = T extends { actions: infer G } ? G : {};
  const persist = options.persist
  const bus = mitt()
  // 缓存初始state
  const cacheStateStore = Object.assign({}, options.state())
  // 读取缓存
  const initState = (persist && getStorage(persist)) || options.state() as Record<string, any>
  const actionKeys: string[] = []
  const _store = observer(null, initState, callback, 'deep' in options ? options.deep : true)
  function callback(id: string) {
    bus.emit('local', id)
  }
  const updateGetters = (store: State<T>) => {
    try {
      Object.keys(options.getters!).map((key) => {
        _store[key] = options.getters && options.getters[key](store)
      })
    } catch (_) {}
  }
  if (options.actions) {
    Object.keys(options.actions).map((key) => {
      actionKeys.push(key)
      _store[key] = options.actions![key].bind(_store as T)
      return key
    })
  }
  updateGetters(initState as State<T>)
  return (storeKey?: string | Array<string>) => {
    const update = useUpdate()
    const store = _store
    useEffect(() => {
      bus.on('local', (emitKey: unknown) => {
        if (!actionKeys.includes(emitKey as string)) {
          if (typeOf(storeKey) === 'string' || typeOf(storeKey) === 'array') {
            if (emitKey === storeKey || (storeKey as string[]).includes(emitKey as string)) {
              updateGetters(_store as T)
              update()
              // 更新缓存
              updateState(cacheStateStore, _store)
              persist && setStorage(persist, JSON.stringify(cacheStateStore))
            }
          } else {
            updateGetters(_store as T)
            update()
            // 更新缓存
            updateState(cacheStateStore, _store)
            persist && setStorage(persist, JSON.stringify(cacheStateStore))
          }
        }
      })
      return () => {
        bus.off('local')
      }
    }, [])
    // 修复类型约束错误
    return store as State<T> & GettersType & actionType
  }
}
