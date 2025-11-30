// 事件类型，可以是字符串或 Symbol
type EventType = string | symbol

/**
 * 事件总线类（发布-订阅模式）
 * 用于管理事件的订阅、发布和取消订阅
 */
export class Dep {
  // 存储事件监听器的 Map，键为事件类型，值为处理函数数组
  protected listeners = new Map<EventType, Array<Function>>()

  /**
   * 订阅事件
   * @param type - 事件类型
   * @param handler - 事件处理函数
   */
  on(type: EventType, handler: Function) {
    // 如果该事件类型还没有监听器数组，则创建一个
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    // 将处理函数添加到监听器数组中
    this.listeners.get(type)!.push(handler)
  }

  /**
   * 发布事件
   * @param type - 事件类型
   * @param evt - 传递给处理函数的事件数据（可选）
   */
  emit(type: EventType, evt?: any) {
    // 获取该事件类型的所有处理函数
    const handlers = this.listeners.get(type)
    if (handlers) {
      // 依次执行所有处理函数
      handlers.forEach((handler) => handler(evt))
    }
  }

  /**
   * 取消订阅事件
   * @param type - 事件类型
   * @param handler - 要移除的处理函数（可选）。如果不传，则清空该事件类型的所有监听器
   */
  off(type: EventType, handler?: Function) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      if (handler) {
        // 如果指定了处理函数，则只移除该函数
        const index = handlers.indexOf(handler)
        if (index !== -1) {
          handlers.splice(index, 1)
        }
      } else {
        // 如果没有指定处理函数，则清空该事件类型的所有监听器
        this.listeners.set(type, [])
      }
    }
  }
}
