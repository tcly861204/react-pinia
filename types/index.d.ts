declare module 'react-pinia' {
  interface ProviderProps {
    store: Record<string, Record<string, any>>
    children: React.ReactNode
  }
  export function Provider(props: ProviderProps): JSX.Element
  export function useState(storeKey?: string | Array<string>): Record<string, Record<string, any>>
  export function createStore(
    store: Record<
      string,
      {
        state: () => Record<string, any>
        actions?: Record<string, any>
        getters?: Record<string, any>
      }
    >
  ): Record<string, any>
  export function defineStore(
    id: string,
    options: {
      state: () => Record<string, any>
      actions?: Record<string, any>
      getters?: Record<string, any>
    }
  ): () => Record<string, any>
}
