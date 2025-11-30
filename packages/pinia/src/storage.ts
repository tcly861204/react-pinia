import { Persist } from './types'

/**
 * 从存储中获取状态数据
 * @template T - 状态数据的类型
 * @param persist - 持久化配置对象
 * @returns 返回存储的状态数据，如果不存在或解析失败则返回 null
 */
export function getStorage<T>(persist: Persist): T | null {
  // 默认使用 localStorage
  let storage = localStorage
  // 如果配置指定使用 sessionStorage，则切换到 sessionStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  try {
    // 从存储中获取数据
    const state = storage.getItem(persist.key)
    if (state) {
      // 将 JSON 字符串解析为对象并返回
      return JSON.parse(state)
    }
  } catch (_) {
    // 如果解析失败，忽略错误
  }
  return null
}

/**
 * 将状态数据保存到存储中
 * @template T - 状态数据的类型
 * @param persist - 持久化配置对象
 * @param val - 要保存的状态数据
 */
export function setStorage<T>(persist: Persist, val: T): void {
  // 默认使用 localStorage
  let storage = localStorage
  // 如果配置指定使用 sessionStorage，则切换到 sessionStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  // 将状态数据序列化为 JSON 字符串并保存
  storage.setItem(persist.key, JSON.stringify(val))
}
