import { State } from './types'

/**
 * 状态变化信息
 * 记录状态变化的详细信息
 */
export interface Mutation<T> {
  /** 变化类型，固定为 'mutation' */
  type: 'mutation'
  /** 变化的状态键 */
  key: keyof State<T>
  /** 旧值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 可选的载荷数据 */
  payload?: any
}

/**
 * Action 调用信息
 * 记录 action 调用的详细信息
 */
export interface ActionInfo {
  /** Action 名称 */
  name: string
  /** Action 参数 */
  args: any[]
  /** Action 调用时间戳 */
  timestamp?: number
}

/**
 * 状态订阅函数类型
 * @template T - 状态类型
 * @param mutation - 状态变化信息
 * @param state - 变化后的状态
 */
export type StateSubscription<T> = (
  mutation: Mutation<T>,
  state: State<T>
) => void

/**
 * Action 订阅函数类型
 * @param action - Action 调用信息
 * @param state - 当前状态
 */
export type ActionSubscription = (
  action: ActionInfo,
  state: any
) => void

/**
 * 取消订阅函数类型
 */
export type Unsubscribe = () => void
