import type { DependencyList } from 'react'

/**
 * 获取值的精确类型
 * @param value - 要检测类型的值
 * @returns 返回值的类型字符串，如 'function', 'array', 'object' 等
 */
export const typeOf = (value: unknown) => {
  // 类型映射表，将 Object.prototype.toString 的结果映射为简洁的类型名称
  const map = new Map([
    ['[object Function]', 'function'],
    ['[object Undefined]', 'undefined'],
    ['[object Boolean]', 'boolean'],
    ['[object Number]', 'number'],
    ['[object String]', 'string'],
    ['[object Array]', 'array'],
    ['[object Date]', 'date'],
    ['[object RegExp]', 'regExp'],
    ['[object Null]', 'null'],
    ['[object Object]', 'object'],
    ['[object Symbol]', 'symbol'],
    ['[object Promise]', 'promise'],
  ])
  return map.get(Object.prototype.toString.call(value))
}

/**
 * 比较两个依赖数组是否相同
 * 用于优化 React hooks 的依赖检测
 * @param oldDeps - 旧的依赖数组
 * @param deps - 新的依赖数组
 * @returns 如果两个数组完全相同返回 true，否则返回 false
 */
export const depsAreSame = (oldDeps: DependencyList, deps: DependencyList): boolean => {
  // 如果是同一个引用，直接返回 true
  if (oldDeps === deps) return true
  // 如果长度不同，返回 false
  if (oldDeps.length !== deps.length) return false
  // 逐个比较数组元素，使用 Object.is 进行严格相等比较
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false
  }
  return true
}

/**
 * 防抖函数
 * 在指定延迟时间内，多次调用只执行最后一次
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 返回防抖后的函数
 */
export const debounce = (fn: Function, delay: number) => {
  let timer: any = null
  return function (this: any, ...args: any[]) {
    // 如果已有定时器，清除它
    if (timer) clearTimeout(timer)
    // 设置新的定时器
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
