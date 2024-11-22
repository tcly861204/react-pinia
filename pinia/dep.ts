type EventType = string | symbol
export class Dep {
  protected listeners = new Map<EventType, Array<Function>>()
  on(type: EventType, handler: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(handler)
  }
  emit(type: EventType, evt?: any) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      handlers.forEach((handler) => handler(evt))
    }
  }
  off(type: EventType, handler?: Function) {
    const handlers = this.listeners.get(type)
    if (handlers) {
      if (handler) {
        const index = handlers.indexOf(handler)
        if (index !== -1) {
          handlers.splice(index, 1)
        }
      } else {
        this.listeners.set(type, [])
      }
    }
  }
}
