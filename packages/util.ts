const toString = (object: unknown) => Object.prototype.toString.call(object)
const proxyMap = new WeakMap()
const rawMap = new WeakMap()

export const typeOf = (value: unknown) => {
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
  return map.get(toString(value))
}

export function observer<T extends Record<string, any>>(
  storeKey: string,
  initialVal: T,
  cb: (K: string) => void
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
      const res = Reflect.get(target, key, receiver)
      return typeOf(res) === 'object' ? observer(storeKey, res, cb) : Reflect.get(target, key)
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val)
      cb(storeKey)
      return ret
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key)
      cb(storeKey)
      return ret
    },
  })
  proxyMap.set(initialVal, proxy)
  rawMap.set(proxy, initialVal)
  return proxy
}