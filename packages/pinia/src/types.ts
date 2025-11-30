// 存储类型常量数组，支持 localStorage 和 sessionStorage
const storageType = ['localStorage', 'sessionStorage']

/**
 * 持久化配置类型
 * @property {string} key - 存储的键名
 * @property {string} [storage] - 存储类型，可选 'localStorage' 或 'sessionStorage'，默认为 'localStorage'
 */
export type Persist = {
  key: string
  storage?: (typeof storageType)[number]
}

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
}

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
