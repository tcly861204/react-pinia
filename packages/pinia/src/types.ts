import { PiniaPlugin } from './plugin'
import { Middleware } from './middleware'


// 存储类型常量数组，支持 localStorage 和 sessionStorage
const storageType = ['localStorage', 'sessionStorage']

/**
 * 序列化器接口
 */
export interface Serializer {
  serialize: (value: any) => string
  deserialize: (value: string) => any
}

/**
 * 加密器接口
 */
export interface Encryption {
  encrypt: (value: string) => string
  decrypt: (value: string) => string
}

/**
 * 持久化配置选项
 */
export interface PersistOptions {
  /** 存储的键名 */
  key: string
  /** 存储类型，默认为 'localStorage' */
  storage?: 'localStorage' | 'sessionStorage'
  /** 只持久化特定路径的状态 */
  paths?: string[]
  /** 自定义序列化器 */
  serializer?: Serializer
  /** 恢复状态前的钩子，可用于转换数据 */
  beforeRestore?: (savedState: any) => any
  /** 恢复状态后的钩子 */
  afterRestore?: (restoredState: any) => void
  /** 加密配置 */
  encryption?: Encryption
  /** 是否开启调试日志 */
  debug?: boolean
}

/**
 * 兼容旧版本的类型别名
 */
export type Persist = PersistOptions

/**
 * 状态类型，从 T 中排除 actions 和 getters 属性
 * @template T - 原始类型
 */
export type State<T> = Omit<T, 'actions' | 'getters'>

/**
 * Getters 类型提取器
 * 如果 T 包含 getters 属性，则提取其类型；否则返回空对象类型
 * @template T - 原始类型
 */
export type Getters<T> = T extends { getters: infer G } ? G : {}

/**
 * Actions 类型提取器
 * 如果 T 包含 actions 属性，则提取其类型；否则返回空对象类型
 * @template T - 原始类型
 */
export type Actions<T> = T extends { actions: infer G } ? G : {}

/**
 * Action 函数类型定义
 * @template S - 状态类型
 */
export type ActionFunction<S> = (this: S, ...args: any[]) => any | Promise<any>

/**
 * 嵌套模块配置类型
 * 用于定义模块的子模块结构
 */
export type NestedModules = {
  [K: string]: StateOption<any>
}

/**
 * 状态选项接口
 * 定义创建 store 时的配置选项
 * @template T - 状态类型
 */
export interface StateOption<T> {
  // 定义状态的初始化函数
  state: () => State<T>
  // 修改状态的方法集合（可选）
  actions?: {
    [key: string]: ActionFunction<State<T>>
  }
  // 监听状态更新并生成派生状态的计算属性（可选）
  getters?: {
    [key: string]: (state: State<T>) => unknown
  }
  // 是否开启缓存持久化数据（可选）
  persist?: Persist
  // 是否深度监听数据变化，默认为 true（可选）
  deep?: boolean
  // DevTools 配置（可选）
  devtools?: boolean | DevToolsOptions
  // 插件列表（可选）
  plugins?: PiniaPlugin[]
  // 中间件列表（可选）
  middleware?: Middleware<T>[]
  // 嵌套子模块（可选）
  modules?: NestedModules
  // 是否使用命名空间（可选）
  namespaced?: boolean
}

export * from './plugin'

/**
 * DevTools 配置选项
 */
export interface DevToolsOptions {
  name?: string
  enabled?: boolean
  trace?: boolean
}

/**
 * 提取 Store 中的 State 类型
 * @template S - Store 配置对象类型
 */
export type StoreState<S> = S extends { state: () => infer R } ? R : never

/**
 * 提取 Store 中的 Getters 类型
 * @template S - Store 配置对象类型
 */
export type StoreGetters<S> = S extends { getters: infer G } ? G : {}

/**
 * 提取 Store 中的 Actions 类型
 * @template S - Store 配置对象类型
 */
export type StoreActions<S> = S extends { actions: infer A } ? A : {}

/**
 * 完整的 Store 类型
 * 包含 State, Getters, Actions
 * @template S - Store 配置对象类型
 */
export type Store<S> = StoreState<S> & StoreGetters<S> & StoreActions<S>
