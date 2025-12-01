import { StateOption, State } from './types'

/**
 * Middleware context provided to each middleware
 * Contains store instance and state accessor
 */
export interface MiddlewareContext<T> {
  /** The store instance */
  store: any
  /** Function to get current state */
  getState: () => State<T>
  /** Store options */
  options: StateOption<T>
}

/**
 * Action information passed through middleware
 */
export interface ActionCall {
  /** Name of the action being called */
  name: string
  /** Arguments passed to the action */
  args: any[]
}

/**
 * Middleware function type
 * Follows Redux-style middleware pattern: context => next => action
 */
export type Middleware<T> = (
  context: MiddlewareContext<T>
) => (next: (action: ActionCall) => any) => (action: ActionCall) => any

/**
 * Compose multiple middleware into a single middleware function
 * Middleware are executed in order: first to last
 * @param middlewares - Array of middleware to compose
 * @returns Composed middleware function
 */
export function composeMiddleware<T>(
  middlewares: Middleware<T>[]
): Middleware<T> {
  return (context: MiddlewareContext<T>) => {
    return (next: (action: ActionCall) => any) => {
      // Build the middleware chain from right to left
      let chain = next
      for (let i = middlewares.length - 1; i >= 0; i--) {
        chain = middlewares[i](context)(chain)
      }
      return chain
    }
  }
}
