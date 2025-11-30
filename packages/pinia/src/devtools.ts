import { StateOption, DevToolsOptions } from './types'

/**
 * 设置 DevTools
 * @param store - Store 对象
 * @param options - Store 配置选项
 * @returns 返回 DevTools 实例接口
 */
export function setupDevTools(store: any, options: StateOption<any>) {
  // 如果不在浏览器环境或未启用 DevTools，直接返回
  if (typeof window === 'undefined' || !options.devtools) return null

  // 解析配置
  const devtoolsOptions: DevToolsOptions =
    typeof options.devtools === 'boolean'
      ? { enabled: options.devtools }
      : options.devtools

  if (!devtoolsOptions.enabled && options.devtools !== true) return null

  // 获取 Redux DevTools 扩展
  const devtools = (window as any).__REDUX_DEVTOOLS_EXTENSION__
  if (devtools) {
    const name = devtoolsOptions.name || 'React-Pinia Store'
    // 连接 DevTools
    const devtoolsInstance = devtools.connect({
      name,
      trace: devtoolsOptions.trace,
    })

    // 初始化状态
    devtoolsInstance.init(store)

    return {
      // 发送状态更新
      send: (action: string, state: any) => {
        devtoolsInstance.send(action, state)
      },
      // 订阅 DevTools 消息（如时间旅行）
      subscribe: (cb: (message: any) => void) => {
        devtoolsInstance.subscribe(cb)
      },
    }
  }
  return null
}
