import { defineStore } from '../src/defineStore'
import { createStore } from '../src/createStore'
import { PiniaPlugin } from '../src/plugin'
import { describe, it, expect } from 'vitest'

describe('Plugin System', () => {
  it('should execute function plugin in defineStore', () => {
    const plugin: PiniaPlugin = ({ store }) => {
      store.pluginProp = 'plugin-value'
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      plugins: [plugin]
    })

    const store = (useStore as any)._store
    expect(store.pluginProp).toBe('plugin-value')
  })

  it('should execute object plugin with install method', () => {
    const plugin: PiniaPlugin = {
      install: ({ store }) => {
        store.objectPluginProp = 'object-plugin-value'
      }
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      plugins: [plugin]
    })

    const store = (useStore as any)._store
    expect(store.objectPluginProp).toBe('object-plugin-value')
  })

  it('should provide pinia context with _s map', () => {
    let piniaContext: any
    const plugin: PiniaPlugin = ({ pinia }) => {
      piniaContext = pinia
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      plugins: [plugin]
    })

    const store = (useStore as any)._store
    expect(piniaContext).toBeDefined()
    expect(piniaContext._s).toBeInstanceOf(Map)
    expect(piniaContext._s.get('current')).toBe(store)
  })

  it('should execute global plugin in createStore', () => {
    const plugin: PiniaPlugin = ({ store }) => {
      store.globalProp = 'global-value'
    }

    const store = createStore({
      main: {
        state: () => ({ count: 0 })
      }
    }, {
      plugins: [plugin]
    })

    const mainStore = (store.main as any)._store
    expect(mainStore.globalProp).toBe('global-value')
  })

  it('should execute both local and global plugins', () => {
    const globalPlugin: PiniaPlugin = ({ store }) => {
      store.global = true
    }
    const localPlugin: PiniaPlugin = ({ store }) => {
      store.local = true
    }

    const store = createStore({
      main: {
        state: () => ({ count: 0 }),
        plugins: [localPlugin]
      }
    }, {
      plugins: [globalPlugin]
    })

    const mainStore = (store.main as any)._store
    expect(mainStore.global).toBe(true)
    expect(mainStore.local).toBe(true)
  })
})
