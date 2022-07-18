import { useCreation, useUpdate } from 'ahooks'
import { useEffect, useRef, createContext, useContext } from 'react'
import { isObject } from './util'
import Event from './bus'
const Context = createContext({})
const evt = new Event()
// k:v 原对象:代理过的对象
const proxyMap = new WeakMap()
// k:v 代理过的对象:原对象
const rawMap = new WeakMap()

function observer<T extends Record<string, any>>(storeKey: string, initialVal: T, cb: (K: string) => void): T {
  const existingProxy = proxyMap.get(initialVal);

  // 添加缓存 防止重新构建proxy
  if (existingProxy) {
    return existingProxy;
  }

  // 防止代理已经代理过的对象
  // https://github.com/alibaba/hooks/issues/839
  if (rawMap.has(initialVal)) {
    return initialVal;
  }

  const proxy = new Proxy<T>(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return isObject(res) ? observer(storeKey, res, cb) : Reflect.get(target, key);
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb(storeKey);
      return ret;
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb(storeKey);
      return ret;
    },
  });

  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);

  return proxy;
}

export const Provider = ({ store, children }: {store: Record<string, Record<string, any>>; children?: React.ReactNode}) => {
  const update = useUpdate()
  const stateRef = useRef(store)
  const state = useCreation(() => {
    const callback = (key: string) => {
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

export const createStore = (storeKey: string) => {
  const update = useUpdate()
  const store = useContext(Context)
  useEffect(() => {
    if (storeKey) {
      evt.once('update', ({ key }: {key: string}) => {
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