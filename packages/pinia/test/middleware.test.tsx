import { defineStore } from '../src/defineStore'
import { createStore } from '../src/createStore'
import { Middleware } from '../src/middleware'
import { describe, it, expect, vi } from 'vitest'

describe('Middleware System', () => {
  it('should execute middleware for actions', () => {
    const calls: string[] = []
    
    const loggingMiddleware: Middleware<any> = () => (next) => (action) => {
      calls.push(`before:${action.name}`)
      const result = next(action)
      calls.push(`after:${action.name}`)
      return result
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        }
      },
      middleware: [loggingMiddleware]
    })

    const store = (useStore as any)._store
    store.increment()
    
    expect(calls).toEqual(['before:increment', 'after:increment'])
    expect(store.count).toBe(1)
  })

  it('should execute middleware in correct order (global -> local)', () => {
    const calls: string[] = []
    
    const globalMiddleware: Middleware<any> = () => (next) => (action) => {
      calls.push('global-before')
      const result = next(action)
      calls.push('global-after')
      return result
    }
    
    const localMiddleware: Middleware<any> = () => (next) => (action) => {
      calls.push('local-before')
      const result = next(action)
      calls.push('local-after')
      return result
    }

    const store = createStore({
      counter: {
        state: () => ({ count: 0 }),
        actions: {
          increment() {
            calls.push('action-execute')
            this.count++
          }
        },
        middleware: [localMiddleware]
      }
    }, {
      middleware: [globalMiddleware]
    })

    const counterStore = (store.counter as any)._store
    counterStore.increment()
    
    expect(calls).toEqual([
      'global-before',
      'local-before',
      'action-execute',
      'local-after',
      'global-after'
    ])
  })

  it('should work with async actions', async () => {
    const calls: string[] = []
    
    const asyncMiddleware: Middleware<any> = () => (next) => async (action) => {
      calls.push('before')
      const result = await next(action)
      calls.push('after')
      return result
    }

    const useStore = defineStore({
      state: () => ({ data: null as any }),
      actions: {
        async fetchData() {
          await new Promise(resolve => setTimeout(resolve, 10))
          this.data = 'loaded'
          return this.data
        }
      },
      middleware: [asyncMiddleware]
    })

    const store = (useStore as any)._store
    const result = await store.fetchData()
    
    expect(calls).toEqual(['before', 'after'])
    expect(result).toBe('loaded')
    expect(store.data).toBe('loaded')
  })

  it('should allow middleware to modify action arguments', () => {
    const addOneMiddleware: Middleware<any> = () => (next) => (action) => {
      // Modify arguments
      const modifiedAction = {
        ...action,
        args: action.args.map((arg: number) => arg + 1)
      }
      return next(modifiedAction)
    }

    const useStore = defineStore({
      state: () => ({ value: 0 }),
      actions: {
        setValue(val: number) {
          this.value = val
        }
      },
      middleware: [addOneMiddleware]
    })

    const store = (useStore as any)._store
    store.setValue(5)
    
    expect(store.value).toBe(6) // 5 + 1
  })

  it('should allow middleware to block action execution', () => {
    const blockMiddleware: Middleware<any> = () => () => (action) => {
      // Don't call next, block the action
      return `blocked:${action.name}`
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        }
      },
      middleware: [blockMiddleware]
    })

    const store = (useStore as any)._store
    const result = store.increment()
    
    expect(result).toBe('blocked:increment')
    expect(store.count).toBe(0) // Action was blocked
  })

  it('should provide store and getState in context', () => {
    let capturedContext: any = null
    
    const contextMiddleware: Middleware<any> = (context) => {
      capturedContext = context
      return (next) => (action) => next(action)
    }

    const useStore = defineStore({
      state: () => ({ count: 5 }),
      actions: {
        increment() {
          this.count++
        }
      },
      middleware: [contextMiddleware]
    })

    const store = (useStore as any)._store
    store.increment()
    
    expect(capturedContext).toBeDefined()
    expect(capturedContext.store).toBe(store)
    expect(capturedContext.getState().count).toBe(6)
    expect(capturedContext.options).toBeDefined()
  })

  it('should compose multiple middleware correctly', () => {
    const calls: string[] = []
    
    const middleware1: Middleware<any> = () => (next) => (action) => {
      calls.push('m1-before')
      const result = next(action)
      calls.push('m1-after')
      return result
    }
    
    const middleware2: Middleware<any> = () => (next) => (action) => {
      calls.push('m2-before')
      const result = next(action)
      calls.push('m2-after')
      return result
    }
    
    const middleware3: Middleware<any> = () => (next) => (action) => {
      calls.push('m3-before')
      const result = next(action)
      calls.push('m3-after')
      return result
    }

    const useStore = defineStore({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          calls.push('action')
          this.count++
        }
      },
      middleware: [middleware1, middleware2, middleware3]
    })

    const store = (useStore as any)._store
    store.increment()
    
    expect(calls).toEqual([
      'm1-before',
      'm2-before',
      'm3-before',
      'action',
      'm3-after',
      'm2-after',
      'm1-after'
    ])
  })

  it('should work without middleware', () => {
    const useStore = defineStore<{ count: number }>({
      state: () => ({ count: 0 }),
      actions: {
        increment() {
          this.count++
        }
      }
    })

    const store = (useStore as any)._store
    store.increment()
    
    expect(store.count).toBe(1)
  })
})
