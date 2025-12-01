import { useRef, createContext, useContext } from 'react'
import { useCreation } from './hooks'
import { StateOption, State, Getters, Actions } from './types'
import { defineStore } from './defineStore'

/**
 * Provider 组件的 props 类型
 */
interface ProviderProps {
  store: ReturnType<typeof createStore>
  children: React.ReactNode
}

// 创建 React Context，用于在组件树中传递 store
const Context = createContext({})

/**
 * Provider 组件
 * 用于在 React 组件树中提供 store，使子组件可以通过 useStore 访问状态
 * @param store - 通过 createStore 创建的 store 对象
 * @param children - 子组件
 * @returns 返回包裹了 Context.Provider 的 JSX 元素
 */
export const Provider = ({ store, children }: ProviderProps): JSX.Element => {
  // 使用 ref 存储 store，避免重复创建
  const stateRef = useRef(store)
  // 使用 useCreation 确保 store 只创建一次
  const state = useCreation(() => {
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}

/**
 * 递归创建嵌套模块
 * @param options - 模块配置
 * @param globalOptions - 全局配置
 * @param parentPath - 父模块路径（用于命名空间）
 * @returns 创建的模块对象
 */
function createNestedStore<T>(
  options: StateOption<T>,
  globalOptions?: {
    plugins?: import('./plugin').PiniaPlugin[]
    middleware?: import('./middleware').Middleware<any>[]
  },
  parentPath: string = ''
): any {
  const storeOptions = { ...options }
  
  // 合并全局插件
  if (globalOptions?.plugins) {
    storeOptions.plugins = [
      ...(globalOptions.plugins || []),
      ...(storeOptions.plugins || [])
    ]
  }
  
  // 合并全局中间件
  if (globalOptions?.middleware) {
    storeOptions.middleware = [
      ...(globalOptions.middleware || []),
      ...(storeOptions.middleware || [])
    ]
  }
  
  // 创建当前层级的 store
  const currentStore = defineStore(storeOptions)
  
  // 如果有嵌套模块，递归创建
  if (options.modules) {
    const nestedModules: any = {}
    
    Object.keys(options.modules).forEach((key) => {
      const modulePath = parentPath ? `${parentPath}.${key}` : key
      const moduleOptions = options.modules![key]
      
      // 递归创建嵌套模块
      nestedModules[key] = createNestedStore(
        moduleOptions,
        globalOptions,
        modulePath
      )
    })
    
    // 将嵌套模块附加到当前 store
    // 使用 Object.assign 而不是直接赋值，以保持响应性
    Object.keys(nestedModules).forEach((key) => {
      Object.defineProperty(currentStore, key, {
        get() {
          return nestedModules[key]
        },
        enumerable: true,
        configurable: true
      })
    })
  }
  
  return currentStore
}

/**
 * 创建多模块状态管理 store
 * 将多个独立的 store 模块组合成一个全局 store，支持嵌套模块
 * @template T - 全局状态类型，包含所有模块的类型定义
 * @param options - 各个模块的配置对象，键为模块名，值为模块的状态选项
 * @param globalOptions - 全局配置选项，如插件和中间件
 * @returns 返回包含所有模块的 store 对象
 */
export const createStore = <T extends { [K in keyof T]: T[K] }>(
  options: { [K in keyof T]: StateOption<T[K]> },
  globalOptions?: { 
    plugins?: import('./plugin').PiniaPlugin[]
    middleware?: import('./middleware').Middleware<any>[]
  }
) => {
  // 创建空的 store 对象
  const store = Object.create(null)
  
  // 遍历所有顶层模块配置
  Object.keys(options).forEach((key) => {
    if (!(key in store)) {
      // 为每个模块创建独立的 store（支持嵌套）
      store[key] = createNestedStore(
        options[key as keyof T],
        globalOptions,
        key
      )
    }
  })
  
  // 返回类型化的 store 对象
  return store as {
    [key: string]: ReturnType<typeof defineStore>
  }
}

/**
 * 在组件中使用 store 的 Hook（不使用 selector）
 * @template T - 全局状态类型
 * @template K - 模块键名
 * @param globalKey - 要访问的模块名
 * @returns 返回该模块的完整状态（包括 state、getters 和 actions）
 */
export function useStore<T extends { [K in keyof T]: T[K] }, K extends keyof T>(
  globalKey: K
): State<T[K]> & Getters<T[K]> & Actions<T[K]>

/**
 * 在组件中使用 store 的 Hook（使用 selector）
 * @template T - 全局状态类型
 * @template K - 模块键名
 * @template S - 选择器返回值类型
 * @param globalKey - 要访问的模块名
 * @param selector - 选择器函数，用于选择部分状态
 * @returns 返回选择器函数的返回值
 */
export function useStore<T extends { [K in keyof T]: T[K] }, K extends keyof T, S>(
  globalKey: K,
  selector: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
): S

/**
 * useStore 的实现
 */
export function useStore<T extends { [K in keyof T]: T[K] }, K extends keyof T, S = any>(
  globalKey: K,
  selector?: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
) {
  // 从 Context 中获取全局 store
  const store = useContext(Context) as {
    [K in keyof T]: (
      selector?: (store: State<T[K]> & Getters<T[K]> & Actions<T[K]>) => S
    ) => S
  }
  // 如果模块存在，调用该模块的 Hook 并传入 selector
  if (globalKey in store) return store[globalKey](selector)
  // 如果模块不存在，返回 null
  return null as any
}
