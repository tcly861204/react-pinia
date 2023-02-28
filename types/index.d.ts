declare const storageType: ['localStorage', 'sessionStorage']
declare type Persist = {
  key: string
  storage?: typeof storageType[number]
}

interface createStoreOption {
  // 定义状态
  state: () => Record<string, any>
  // 修改状态
  actions?: Record<string, (this: Record<string, any>, ...args: any) => any>
  // 监听状态更新生成新的状态
  getters?: Record<string, (state: Record<string, any>) => any>
  // 是否开启缓存持久化数据
  persist?: Persist
  // 是否深度监听数据
  deep?: boolean
}
declare const defineStore: (
  options: createStoreOption
) => (storeKey?: string | Array<string>) => Record<string, any>

declare const version = '2.5.3'

interface ProviderProps {
  store: Record<string, Record<string, any>>
  children: React.ReactNode
}
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element
declare const defineModel: (options: createStoreOption) => createStoreOption
declare const createStore: (options: Record<string, createStoreOption>) => Record<string, any>
declare const useStore: (
  globalKey: string,
  storeKey?: string | Array<string>
) => Record<string, any>

export {
  Provider,
  ProviderProps,
  createStore,
  createStoreOption,
  defineModel,
  defineStore,
  useStore,
  version,
}
