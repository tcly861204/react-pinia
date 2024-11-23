const storageType = ['localStorage', 'sessionStorage']
export type Persist = {
  key: string
  storage?: (typeof storageType)[number]
}

export type State<T> = Omit<T, 'actions' | 'getters'>

export type Getters<T> = T extends { getters: infer G } ? G : {}

export type Actions<T> = T extends { actions: infer G } ? G : {}

export interface StateOption<T> {
  // 定义状态
  state: () => State<T>
  // 修改状态
  actions?: {
    [key: string]: (this: State<T>, ...args: any[]) => unknown
  }
  // 监听状态更新生成新的状态
  getters?: {
    [key: string]: (state: State<T>) => unknown
  }
  // 是否开启缓存持久化数据
  persist?: Persist
  deep?: boolean // 是否深度监听数据
}
