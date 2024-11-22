import { typeOf } from './utils'
const proxyMap = new WeakMap()
const rawMap = new WeakMap()
export function observer<T extends Record<string, any>>(
  storeKey: string | null,
  initialVal: T,
  cb: (T: string, U: string | null) => void,
  deep = true
): T {
  const existingProxy = proxyMap.get(initialVal)
  if (existingProxy) {
    return existingProxy
  }
  if (rawMap.has(initialVal)) {
    return initialVal
  }
  const proxy = new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      if (!deep) {
        return Reflect.get(target, key)
      }
      const res = Reflect.get(target, key, receiver)
      return (typeOf(res) === 'object' || typeOf(res) === 'array') ? observer(storeKey, res, cb, deep) : Reflect.get(target, key)
    },
    set(target, key, val) {
      if (target[key as string] === val) {
        return Reflect.set(target, key, val)
      } else {
        const ret = Reflect.set(target, key, val)
        cb(key as string, storeKey)
        return ret
      }
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key)
      cb(key as string, storeKey)
      return ret
    },
  })
  proxyMap.set(initialVal, proxy)
  rawMap.set(proxy, initialVal)
  return proxy
}