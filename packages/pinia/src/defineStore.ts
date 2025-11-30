import { StateOption, State, Getters, Actions } from './types'
import { observer } from './observer'
import { useUpdate } from './hooks'
import { debounce } from './utils'
import { useEffect, useRef } from 'react'
import { Dep } from './dep'
import { getStorage, setStorage } from './storage'

/**
 * Getter 缓存接口
 * 用于存储 getter 的计算结果和依赖信息
 */
interface GetterCache {
  value: any           // 缓存的计算结果
  deps: Set<string>    // 依赖的状态键集合
  dirty: boolean       // 是否需要重新计算的标记
}

/**
 * 定义一个状态管理 store
 * 创建一个响应式的状态管理器，支持状态、操作、计算属性和持久化
 * @template T - 状态类型
 * @param options - 状态选项配置
 * @returns 返回一个 Hook 函数，用于在组件中访问和订阅状态
 */
export function defineStore<T>(options: StateOption<T>) {
  // 创建唯一标识符，用于事件总线
  const uid = Symbol()
  // 创建事件总线，用于通知状态变化
  const bus = new Dep()
  // 获取持久化配置
  const persist = options.persist
  // 初始化状态：合并默认状态和持久化存储的状态
  const initState = Object.assign({}, options.state(), persist && getStorage<State<T>>(persist))
  
  // Getter 缓存存储：存储每个 getter 的缓存信息
  const getterCaches = new Map<string, GetterCache>()
  
  // 状态变化回调函数，传递变化的键
  const callback = (key: string) => {
    bus.emit(uid, key)
  }
  // 创建响应式代理对象，监听状态变化
  const proxyMap = new WeakMap()
  const rawMap = new WeakMap()
  const proxyState = observer(null, initState, callback, true, proxyMap, rawMap)
  // 创建 store 对象，继承自代理状态
  const _store = Object.create(proxyState)
  
  // 绑定 actions 到 store 对象
  if (options.actions) {
    Object.keys(options.actions).forEach((key: string) => {
      // 将 action 方法的 this 绑定到代理状态，确保在 action 中可以直接修改状态
      _store[key] = options.actions![key].bind(proxyState)
    })
  }
  
  /**
   * 创建依赖追踪代理
   * 用于记录 getter 函数访问了哪些状态属性
   * @param state - 状态对象
   * @param deps - 依赖集合，用于存储访问的键
   * @returns 返回代理对象
   */
  function createDepsTracker(state: State<T>, deps: Set<string>) {
    return new Proxy(state, {
      get(target, key, receiver) {
        // 记录访问的键到依赖集合
        if (typeof key === 'string') {
          deps.add(key)
        }
        return Reflect.get(target, key, receiver)
      }
    })
  }
  
  /**
   * 更新计算属性（getters）
   * 支持智能缓存，只在依赖的状态变化时重新计算
   * @param store - 当前状态对象
   * @param changedKey - 发生变化的状态键（可选）
   */
  function updateGetters(store: State<T>, changedKey?: string) {
    if (!options.getters) return
    
    Object.keys(options.getters).forEach((getterKey) => {
      // 获取或创建缓存
      let cache = getterCaches.get(getterKey)
      
      // 如果没有缓存，初始化
      if (!cache) {
        cache = {
          value: undefined,
          deps: new Set<string>(),
          dirty: true
        }
        getterCaches.set(getterKey, cache)
      }
      
      // 判断是否需要重新计算
      // 1. 如果是脏的（第一次计算或被标记为需要更新）
      // 2. 如果没有 changedKey（全量更新）
      // 3. 如果 changedKey 在依赖中（依赖的状态变化了）
      const shouldUpdate = cache.dirty || 
                          !changedKey || 
                          cache.deps.has(changedKey)
      
      if (shouldUpdate) {
        // 清空依赖集合，重新收集
        cache.deps.clear()
        
        // 创建依赖追踪代理
        const trackedState = createDepsTracker(store, cache.deps)
        
        // 重新计算 getter
        cache.value = options.getters![getterKey](trackedState)
        cache.dirty = false
        
        // 更新到 store
        _store[getterKey] = cache.value
      }
    })
  }
  
  // 初始化时计算一次 getters
  updateGetters(initState)
  
  /**
   * 用于在组件中使用的 Hook 函数
   * @param selector - 可选的选择器函数，用于选择部分状态
   * @returns 返回选择的状态或完整的 store
   */
  function useHooks(selector?: (state: State<T> & Getters<T> & Actions<T>) => any) {
    // 获取强制更新函数
    const update = useUpdate()
    // 使用 ref 存储 selector，避免闭包问题
    const selectorRef = useRef(selector)
    selectorRef.current = selector
    
    // 计算当前选择的值
    const currentSelection = selector ? selector(_store) : _store
    const selectionRef = useRef(currentSelection)
    selectionRef.current = currentSelection

    useEffect(() => {
      // 创建防抖的持久化存储函数（300ms 延迟）
      const debouncedSetStorage = debounce((val: any) => {
        persist && setStorage(persist, val)
      }, 300)

      // 状态变化处理函数，接收变化的键
      const handler = (changedKey: string) => {
        // 如果开启了持久化，将状态保存到存储
        persist && debouncedSetStorage(proxyState)
        // 更新计算属性，传递变化的键以实现智能缓存
        updateGetters(_store, changedKey)

        // 使用 Promise.resolve().then 实现微任务批处理，优化性能
        Promise.resolve().then(() => {
          if (selectorRef.current) {
            // 如果使用了 selector，只有选择的值变化时才触发更新
            const newSelection = selectorRef.current(_store)
            if (newSelection !== selectionRef.current) {
              update()
            }
          } else {
            // 如果没有使用 selector，直接触发更新
            update()
          }
        })
      }
      // 订阅状态变化事件
      bus.on(uid, handler)
      // 组件卸载时取消订阅
      return () => {
        bus.off(uid, handler)
      }
    }, [])
    
    return currentSelection as State<T> & Getters<T> & Actions<T>
  }
  
  /**
   * 获取原始状态对象的方法
   * 用于直接访问状态，不触发 React 的重新渲染
   */
  useHooks.get = function () {
    return proxyState
  }
  
  return useHooks
}
