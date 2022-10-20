declare module 'react-pinia' {
  interface ProviderProps {
    store: Record<string, Record<string, any>>
    children: React.ReactNode
  }
  export interface createStoreOption {
    state: () => Record<string, any>
    actions?: Record<string, (this: Record<string, any>) => any>
    getters?: Record<string, (state: Record<string, any>) => any>
  }
  export function Provider(props: ProviderProps): JSX.Element
  export const createStore: (options: Record<string, createStoreOption>) => Record<string, any>
  export const useStore: (
    globalKey: string
  ) => (storeKey?: string | Array<string>) => Record<string, any>
  export const defineStore: (
    options: createStoreOption
  ) => (storeKey?: string | Array<string>) => Record<string, any>
}
