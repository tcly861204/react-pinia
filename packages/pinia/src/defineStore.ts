import { StateOption, State, Getters, Actions } from './types'
import { observer } from './observer'
import { useUpdate } from './hooks'
import { useEffect, useRef } from 'react'
import { Dep } from './dep'
import { getStorage, setStorage } from './storage'

export function defineStore<T>(options: StateOption<T>) {
  const uid = Symbol()
  const bus = new Dep()
  const persist = options.persist
  const initState = Object.assign({}, options.state(), persist && getStorage<State<T>>(persist))
  const callback = (key: string) => {
    bus.emit(uid, key)
  }
  const proxyState = observer(null, initState, callback, true)
  const _store = Object.create(proxyState)
  if (options.actions) {
    Object.keys(options.actions).forEach((key: string) => {
      _store[key] = options.actions![key].bind(proxyState)
    })
  }
  function updateGetters(store: State<T>) {
    if (options.getters) {
      Object.keys(options.getters).map((key) => {
        _store[key] = options.getters && options.getters[key](store)
      })
    }
  }
  updateGetters(initState)
  function useHooks(selector?: (state: State<T> & Getters<T> & Actions<T>) => any) {
    const update = useUpdate()
    const selectorRef = useRef(selector)
    selectorRef.current = selector
    
    const currentSelection = selector ? selector(_store) : _store
    const selectionRef = useRef(currentSelection)
    selectionRef.current = currentSelection

    useEffect(() => {
      const handler = () => {
        persist && setStorage(persist, proxyState)
        updateGetters(_store)
        
        if (selectorRef.current) {
          const newSelection = selectorRef.current(_store)
          if (newSelection !== selectionRef.current) {
            update()
          }
        } else {
          update()
        }
      }
      bus.on(uid, handler)
      return () => {
        bus.off(uid, handler)
      }
    }, [])
    return currentSelection as State<T> & Getters<T> & Actions<T>
  }
  useHooks.get = function () {
    return proxyState
  }
  return useHooks
}
