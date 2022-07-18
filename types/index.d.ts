declare module "react-pinia" {
  interface ProviderProps {
    store: Record<string, Record<string, any>>;
    children: React.ReactNode
  }
  export function Provider(props: ProviderProps): React.ReactNode;
  export function createStore(key: string): Record<string, Record<string, any>>;
}
