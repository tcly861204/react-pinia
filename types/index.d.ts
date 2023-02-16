interface createStoreOption {
  state: () => Record<string, any>
  actions?: Record<string, (this: Record<string, any>, ...args: any) => any>
  getters?: Record<string, (state: Record<string, any>) => any>
}
declare const defineStore: (
  options: createStoreOption
) => (storeKey?: string | Array<string>) => Record<string, any>

declare const version = '2.2.0'

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
