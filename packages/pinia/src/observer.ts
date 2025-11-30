import { typeOf } from './utils'

// 用于缓存原始对象到代理对象的映射，避免重复创建代理
const proxyMap = new WeakMap()
// 用于缓存代理对象到原始对象的映射，用于判断对象是否已被代理
const rawMap = new WeakMap()

/**
 * 创建响应式观察者
 * 使用 Proxy 实现对象的响应式监听，当对象属性发生变化时触发回调
 * @template T - 对象类型，必须是 Record<string, any> 的子类型
 * @param storeKey - store 的键名，用于标识是哪个 store 的状态
 * @param initialVal - 要观察的初始值对象
 * @param cb - 当属性变化时的回调函数，接收变化的属性名和 storeKey
 * @param deep - 是否深度监听，默认为 true。如果为 true，嵌套对象也会被代理
 * @returns 返回代理后的响应式对象
 */
export function observer<T extends Record<string, any>>(
  storeKey: string | null,
  initialVal: T,
  cb: (T: string, U: string | null) => void,
  deep = true
): T {
  // 检查是否已经为该对象创建过代理，如果有则直接返回
  const existingProxy = proxyMap.get(initialVal)
  if (existingProxy) {
    return existingProxy
  }
  // 检查对象本身是否已经是代理对象，如果是则直接返回
  if (rawMap.has(initialVal)) {
    return initialVal
  }
  // 创建 Proxy 代理对象
  const proxy = new Proxy<T>(initialVal, {
    // 拦截属性读取操作
    get(target, key, receiver) {
      // 如果不需要深度监听，直接返回属性值
      if (!deep) {
        return Reflect.get(target, key)
      }
      // 获取属性值
      const res = Reflect.get(target, key, receiver)
      // 如果属性值是对象或数组，递归创建代理；否则直接返回
      return typeOf(res) === 'object' || typeOf(res) === 'array'
        ? observer(storeKey, res, cb, deep)
        : Reflect.get(target, key)
    },
    // 拦截属性设置操作
    set(target, key, val) {
      // 如果新值与旧值相同，直接返回，不触发回调
      if (target[key as string] === val) {
        return Reflect.set(target, key, val)
      } else {
        // 设置新值
        const ret = Reflect.set(target, key, val)
        // 触发回调，通知状态变化
        cb(key as string, storeKey)
        return ret
      }
    },
    // 拦截属性删除操作
    deleteProperty(target, key) {
      // 删除属性
      const ret = Reflect.deleteProperty(target, key)
      // 触发回调，通知状态变化
      cb(key as string, storeKey)
      return ret
    },
  })
  // 缓存原始对象到代理对象的映射
  proxyMap.set(initialVal, proxy)
  // 缓存代理对象到原始对象的映射
  rawMap.set(proxy, initialVal)
  return proxy
}
