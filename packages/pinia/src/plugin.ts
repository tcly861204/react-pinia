import { StateOption } from './types'

export interface Pinia {
  install(app: any): void
  use(plugin: PiniaPlugin): Pinia
  _s: Map<string, any>
}

export interface PluginContext {
  store: any
  options: StateOption<any>
  pinia: Pinia
}

export type PiniaPlugin =
  | ((context: PluginContext) => void)
  | { install: (context: PluginContext) => void }

