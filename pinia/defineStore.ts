import { StateOption, State, Getters, Actions } from './types'
import { observer } from './observer'
import { useUpdate } from './hooks'
import { useEffect } from 'react'
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
  return () => {
    const update = useUpdate()
    useEffect(() => {
      bus.on(uid, () => {
        persist && setStorage(persist, proxyState)
        updateGetters(_store)
        update()
      })
      return () => {
        bus.off(uid)
      }
    }, [])
    return _store as State<T> & Getters<T> & Actions<T>
  }
}
