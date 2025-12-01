import { PersistOptions } from './types'

/**
 * 获取存储对象
 */
function getStorageEngine(persist: PersistOptions): Storage {
  if (persist.storage === 'sessionStorage') {
    return sessionStorage
  }
  return localStorage
}

/**
 * 从存储中获取状态数据
 * @template T - 状态数据的类型
 * @param persist - 持久化配置对象
 * @returns 返回存储的状态数据，如果不存在或解析失败则返回 null
 */
export function getStorage<T>(persist: PersistOptions): T | null {
  const storage = getStorageEngine(persist)
  
  try {
    const key = persist.key
    let raw = storage.getItem(key)
    
    if (!raw) return null

    // 1. 解密
    if (persist.encryption) {
      try {
        raw = persist.encryption.decrypt(raw)
      } catch (e) {
        if (persist.debug) console.error(`[react-pinia] Decryption failed for key "${key}":`, e)
        return null
      }
    }

    // 2. 反序列化
    let state: any
    if (persist.serializer) {
      state = persist.serializer.deserialize(raw)
    } else {
      state = JSON.parse(raw)
    }

    // 3. 恢复前钩子
    if (persist.beforeRestore) {
      state = persist.beforeRestore(state)
    }

    return state as T
  } catch (e) {
    if (persist.debug) console.error(`[react-pinia] Failed to restore state for key "${persist.key}":`, e)
    return null
  }
}

/**
 * 将状态数据保存到存储中
 * @template T - 状态数据的类型
 * @param persist - 持久化配置对象
 * @param val - 要保存的状态数据
 */
export function setStorage<T>(persist: PersistOptions, val: T): void {
  const storage = getStorageEngine(persist)
  
  try {
    let stateToSave: any = val

    // 1. 路径过滤
    if (persist.paths && persist.paths.length > 0) {
      stateToSave = {}
      persist.paths.forEach(path => {
        // 简单支持一级路径，如果需要支持嵌套路径（如 'user.name'），需要更复杂的 lodash.get 类似逻辑
        // 这里暂时只支持一级 key
        if ((val as any)[path] !== undefined) {
          stateToSave[path] = (val as any)[path]
        }
      })
    }

    // 2. 序列化
    let serialized: string
    if (persist.serializer) {
      serialized = persist.serializer.serialize(stateToSave)
    } else {
      serialized = JSON.stringify(stateToSave)
    }

    // 3. 加密
    if (persist.encryption) {
      serialized = persist.encryption.encrypt(serialized)
    }

    storage.setItem(persist.key, serialized)
  } catch (e) {
    if (persist.debug) console.error(`[react-pinia] Failed to save state for key "${persist.key}":`, e)
  }
}
