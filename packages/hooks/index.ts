import type { DependencyList } from 'react'
import { useCallback, useState, useRef } from 'react'
import { depsAreSame } from '../utils/index'

export function useUpdate() {
  const [, setState] = useState({})
  return useCallback(() => setState({}), [])
}

export function useCreation<T>(factory: () => T, deps: DependencyList) {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  })
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps
    current.obj = factory()
    current.initialized = true
  }
  return current.obj as T
}
