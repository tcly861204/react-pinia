import { Persist } from './types'

export function getStorage<T>(persist: Persist): T | null {
  let storage = localStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  try {
    const state = storage.getItem(persist.key)
    if (state) {
      return JSON.parse(state)
    }
  } catch (_) {}
  return null
}

export function setStorage<T>(persist: Persist, val: T): void {
  let storage = localStorage
  if ('storage' in persist && persist.storage === 'sessionStorage') {
    storage = sessionStorage
  }
  storage.setItem(persist.key, JSON.stringify(val))
}
