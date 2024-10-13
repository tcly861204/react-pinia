declare const storageType: ['localStorage', 'sessionStorage']
declare type Persist = {
  key: string
  storage?: typeof storageType[number]
}

interface createStoreOption {
  state: <T extends Record<string, any>>() => T
  actions?: Record<string, (this: Record<string, any>, ...args: any) => any>
  getters?: Record<string, (state: Record<string, any>) => any>
  persist?: Persist
  deep?: boolean
}
/**
 * defineStore
 * @param createStoreOption
 * @returns Record<string, any>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const defineStore: (
  options: createStoreOption
) => (storeKey?: string | Array<string>) => Record<string, any>

declare const version = '2.5.5'

interface ProviderProps {
  store: Record<string, Record<string, any>>
  children: React.ReactNode
}
/**
 * Provider
 * @param ProviderProps
 * @returns JSX.Element
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const Provider: ({ store, children }: ProviderProps) => JSX.Element
/**
 * defineModel
 * @param createStoreOption
 * @returns createStoreOption
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const defineModel: (options: createStoreOption) => createStoreOption
/**
 * createStore
 * @param Record<string, createStoreOption>
 * @returns Record<string, createStoreOption>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
declare const createStore: (options: Record<string, createStoreOption>) => Record<string, any>
/**
 * useStore
 * @param string
 * @param [string | Array<string>]
 * @returns Record<string, createStoreOption>
 * @author tcly861204
 * @github https://github.com/tcly861204
 */
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
