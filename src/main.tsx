import { useCreation, useUpdate } from 'ahooks'
import { useEffect, useRef, createContext, useContext } from 'react'
import { isObject } from './util'

const Context = createContext({})
class Event {
  constructor() {
    this.events = {}
  }
  // 监听一个事件
  on(type, callback) {
    // 对象里面是否有type这个属性,如果有,直接push回调函数,没有则重新建立.
    ;(this.events[type] || (this.events[type] = [])).push({ listener: callback })
  }
  // 发布一个事件
  emit(type, args) {
    this.events[type].forEach((element) => {
      element.listener(args)
      if (type === 'once') {
        this.off(type, element.listener)
      }
    })
  }
  // 事件只执行一次
  once(type, listener) {
    this.events[type] = this.events[type] || []
    this.events[type].push({ listener, once: true })
  }
  // 当传过来的callback相等,则取消该方法.
  off(type, callback) {
    if (this.events[type]) {
      this.events[type] = this.events[type].filter((item) => item.listener !== callback)
    }
  }
}

const evt = new Event()

// k:v 原对象:代理过的对象
const proxyMap = new WeakMap()
// k:v 代理过的对象:原对象
const rawMap = new WeakMap()

function observer(storeKey, initialVal, cb) {
  const existingProxy = proxyMap.get(initialVal)

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal
  }

  const proxy = new Proxy(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      return isObject(res) ? observer(storeKey, res, cb) : Reflect.get(target, key)
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

export const Provider = ({ store, children }) => {
  const update = useUpdate()
  const stateRef = useRef(store)
  const state = useCreation(() => {
    const callback = (key) => {
      update()
      evt.emit('update', { key })
    }
    Object.keys(stateRef.current).map((key) => {
      stateRef.current[key] = observer(key, stateRef.current[key], callback)
    })
    return stateRef.current
  }, [])
  return <Context.Provider value={state}>{children}</Context.Provider>
}

export const createStore = (storeKey) => {
  const update = useUpdate()
  const store = useContext(Context)
  useEffect(() => {
    if (storeKey) {
      evt.once('update', ({ key }) => {
        if (storeKey === key) {
          update()
        }
      })
    } else {
      evt.once('update', update)
    }
    return () => {
      evt.off('update', update)
    }
  }, [])
  return store
}