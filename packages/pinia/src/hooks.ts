import { useState, useCallback, useRef } from 'react'
import type { DependencyList } from 'react'
import { depsAreSame } from './utils'

/**
 * 强制组件重新渲染的 Hook
 * @returns 返回一个函数，调用该函数会触发组件重新渲染
 */
export function useUpdate() {
  // 使用空对象作为状态，每次更新都创建新对象以触发重渲染
  const [, setState] = useState({})
  // 返回一个稳定的更新函数（使用 useCallback 避免每次渲染都创建新函数）
  return useCallback(() => setState({}), [])
}

/**
 * 创建持久化的值的 Hook
 * 类似于 useMemo，但使用自定义的依赖比较逻辑
 * 只有当依赖项真正变化时才会重新创建值，避免不必要的计算
 * @template T - 创建的值的类型
 * @param factory - 创建值的工厂函数
 * @param deps - 依赖项数组
 * @returns 返回创建的值
 */
export function useCreation<T>(factory: () => T, deps: DependencyList) {
  // 使用 useRef 存储依赖项、创建的对象和初始化状态
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  })
  // 如果是第一次初始化，或者依赖项发生变化，则重新创建对象
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps
    current.obj = factory()
    current.initialized = true
  }
  // 返回创建的对象
  return current.obj as T
}
