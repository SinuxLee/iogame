const events = require('events')

/**
 * 网络接入层，屏蔽网络特性(http/tcp/udp)
 * 将请求转换成消息，驱动 service 运转。
 * 管理网络长连接
 */
class ServiceHandler extends events.EventEmitter{
  #middlewares = []

  /**
   * fn 返回一个闭包
   * @param {Function} fn 
   * @returns 
   */
  use(fn){
      if(typeof fn !== 'function') return

      this.#middlewares.push(fn)
      return this
  }

  on(eventName, next){
      let idx = this.#middlewares.length;
      while (idx--) next = this.#middlewares[idx](next);

      super.on(eventName, next)
      return this
  }
}

if(require.main === module){
  const h = new ServiceHandler()
  h.use((next)=> (...args)=>{
      console.log('middleware1', args)
      next(...args)
  })

  h.use((next)=> (...args)=>{
      console.log('middleware2', args)
      next(...args)
  })

  h.on(1,(data)=>{
      console.log('test', data)
  })

  h.emit(1,{name:'libz'})
}

module.exports = Service
