const toString = (object: unknown) => Object.prototype.toString.call(object)
declare const storageType: ['localStorage', 'sessionStorage']
export type Persist = {
  key: string
  storage?: typeof storageType[number]
}

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
      return typeOf(res) === 'object' ? observer(storeKey, res, cb, deep) : Reflect.get(target, key)
    },
    set(target, key, val) {
      if (target[key as string] === val) {
        // 当更新的值不变的时候
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

export function getStorage(persist: Persist): Record<string, any> | null {
  let storage = localStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  try {
    const local = storage.getItem(persist.key)
    if (local) {
      return JSON.parse(local)
    }
  } catch (_) {}
  return null
}

export function setStorage(persist: Persist, val: string): void {
  let storage = localStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  try {
    storage.setItem(persist.key, val)
  } catch (_) {}
}

export function updateState(initState: Record<string, any>, store: Record<string, any>): void {
  Object.keys(initState).forEach((key) => {
    initState[key] = store[key]
  })
}
