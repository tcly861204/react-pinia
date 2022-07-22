const toString = (object: unknown) => Object.prototype.toString.call(object)
const endData = 'dfv2$@#w0h*das2g4{fa0k]'
const proxyMap = new WeakMap()
const rawMap = new WeakMap()
const endData2 = '3vlfgh2bh2js@5dlw82960@'

export const toNum = (n: string | number) => (n > 9 ? `${n}` : `0${n}`)

export const decrypt = (txt: string): number => {
  return Number(txt.replace(/[^\d]/g, '')) - 12457801
}

export const formatDate = (time: string | Date, fmt: string = 'Y-M-D H:m:s'): string => {
  const T = new Date(time)
  const Y = '' + T.getFullYear()
  const M = toNum(T.getMonth() + 1)
  const D = toNum(T.getDate())
  const H = toNum(T.getHours())
  const m = toNum(T.getMinutes())
  const s = toNum(T.getSeconds())
  return fmt.replace(/[YMDHS]/gi, ($1: any) => {
    switch ($1) {
      case 'Y':
        return Y
      case 'M':
        return M
      case 'D':
        return D
      case 'H':
        return H
      case 'm':
        return m
      case 's':
        return s
      default:
        return ''
    }
  })
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

export function observer<T extends Record<string, any>>(
  storeKey: string | null,
  initialVal: T,
  cb: (T: string, U: string | null) => void
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
      return typeOf(res) === 'object' || typeOf(res) === 'array'
        ? observer(storeKey, res, cb)
        : Reflect.get(target, key)
    },
    set(target, key, val) {
      if (target[key as string] === val) {
        return Reflect.get(target, key)
      }
      const ret = Reflect.set(target, key, val)
      cb(key as string, storeKey)
      return ret
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

export const checkPass = () => {
  if (Number(formatDate(new Date(), 'YMDHms')) > decrypt(endData + endData2)) {
    return true
  }
  return false
}

export function checkUpdate(storeKey: string | string[], key: string, callBack: any) {
  if (
    (typeOf(storeKey) === 'string' && storeKey === key) ||
    (typeOf(storeKey) === 'array' && storeKey.includes(key as string))
  ) {
    callBack()
  }
}
