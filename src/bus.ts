class Event {
  events: Record<string, any>
  constructor() {
    this.events = {}
  }
  // 监听一个事件
  on(type: string, callback: (T: any) => void) {
    // 对象里面是否有type这个属性,如果有,直接push回调函数,没有则重新建立.
    ;(this.events[type] || (this.events[type] = [])).push({ listener: callback })
  }
  // 发布一个事件
  emit(type: string, args: any) {
    this.events[type].forEach((element: any) => {
      element.listener(args)
      if (type === 'once') {
        this.off(type, element.listener)
      }
    })
  }
  // 事件只执行一次
  once(type: string, listener: (T: any) => void) {
    this.events[type] = this.events[type] || []
    this.events[type].push({ listener, once: true })
  }
  // 当传过来的callback相等,则取消该方法.
  off(type: string, callback: () => void) {
    if (this.events[type]) {
      this.events[type] = this.events[type].filter((item: any) => item.listener !== callback)
    }
  }
}
export default Event