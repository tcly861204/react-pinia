import { StateOption, DevToolsOptions } from './types'

/**
 * DevTools 实例接口
 * 提供与 Redux DevTools 交互的方法
 */
export interface DevToolsInstance {
  /**
   * 发送 action 和状态到 DevTools
   * @param action - Action 名称或对象
   * @param state - 当前状态
   */
  send: (action: string | { type: string; payload?: any }, state: any) => void
  
  /**
   * 订阅 DevTools 消息（用于时间旅行调试）
   * @param callback - 消息处理回调函数
   * @returns 取消订阅的函数
   */
  subscribe: (callback: (message: any) => void) => (() => void) | void
  
  /**
   * 断开 DevTools 连接
   */
  disconnect?: () => void
}

/**
 * 设置 DevTools
 * 集成 Redux DevTools Extension，提供状态追踪、时间旅行等调试功能
 * @param store - Store 对象（响应式代理状态）
 * @param options - Store 配置选项
 * @param onStateRestore - 状态恢复回调函数（用于时间旅行）
 * @returns 返回 DevTools 实例接口，如果未启用则返回 null
 */
export function setupDevTools(
  store: any,
  options: StateOption<any>,
  onStateRestore?: (state: any) => void
): DevToolsInstance | null {
  // 如果不在浏览器环境或未启用 DevTools，直接返回
  if (typeof window === 'undefined' || !options.devtools) return null

  // 解析配置
  const devtoolsOptions: DevToolsOptions =
    typeof options.devtools === 'boolean'
      ? { enabled: options.devtools }
      : options.devtools

  // 检查是否启用
  if (!devtoolsOptions.enabled && options.devtools !== true) return null

  // 获取 Redux DevTools 扩展
  const extension = (window as any).__REDUX_DEVTOOLS_EXTENSION__
  if (!extension) {
    // 如果没有安装 DevTools 扩展，在开发环境下给出提示
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[React-Pinia] Redux DevTools Extension is not installed. ' +
        'Install it from https://github.com/reduxjs/redux-devtools'
      )
    }
    return null
  }

  try {
    const name = devtoolsOptions.name || 'React-Pinia Store'
    
    // 连接 DevTools
    const devtoolsInstance = extension.connect({
      name,
      trace: devtoolsOptions.trace ?? false,
      features: {
        pause: true,      // 允许暂停
        lock: true,       // 允许锁定
        persist: true,    // 允许持久化
        export: true,     // 允许导出
        import: 'custom', // 允许导入
        jump: true,       // 允许跳转
        skip: true,       // 允许跳过
        reorder: true,    // 允许重新排序
        dispatch: true,   // 允许派发
        test: true,       // 允许测试
      },
    })

    // 初始化状态
    devtoolsInstance.init(store)

    // 订阅 DevTools 消息以支持时间旅行
    const unsubscribe = devtoolsInstance.subscribe((message: any) => {
      // 处理时间旅行和状态恢复
      if (message.type === 'DISPATCH') {
        switch (message.payload?.type) {
          case 'JUMP_TO_STATE':
          case 'JUMP_TO_ACTION':
            // 时间旅行：恢复到指定状态
            if (message.state && onStateRestore) {
              try {
                const newState = JSON.parse(message.state)
                onStateRestore(newState)
              } catch (error) {
                console.error('[React-Pinia] Failed to restore state:', error)
              }
            }
            break
          
          case 'RESET':
            // 重置到初始状态
            if (onStateRestore && options.state) {
              onStateRestore(options.state())
            }
            break
          
          case 'COMMIT':
            // 提交当前状态作为初始状态
            devtoolsInstance.init(store)
            break
          
          case 'ROLLBACK':
            // 回滚到上次提交的状态
            if (message.state && onStateRestore) {
              try {
                const newState = JSON.parse(message.state)
                onStateRestore(newState)
              } catch (error) {
                console.error('[React-Pinia] Failed to rollback state:', error)
              }
            }
            break
          
          case 'IMPORT_STATE':
            // 导入状态
            if (message.payload?.nextLiftedState?.computedStates) {
              const computedStates = message.payload.nextLiftedState.computedStates
              const lastState = computedStates[computedStates.length - 1]?.state
              if (lastState && onStateRestore) {
                onStateRestore(lastState)
              }
            }
            break
        }
      }
    })

    return {
      send: (action: string | { type: string; payload?: any }, state: any) => {
        devtoolsInstance.send(action, state)
      },
      subscribe: (callback: (message: any) => void) => {
        return devtoolsInstance.subscribe(callback)
      },
      disconnect: () => {
        if (unsubscribe) unsubscribe()
        devtoolsInstance.disconnect?.()
      },
    }
  } catch (error) {
    console.error('[React-Pinia] Failed to setup DevTools:', error)
    return null
  }
}
