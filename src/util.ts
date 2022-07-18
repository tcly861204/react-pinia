export const isObject = (value: unknown): value is Record<any, any> =>
  value !== null && typeof value === 'object';