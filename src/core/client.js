const net = require('net')
const log = require('./logger')
const io = require('socket.io-client')

class TCPClient {
  connect (port, host='localhost') {
    const s = new net.Socket()
    this.#socket = s
    s.on('ready', this.init.bind(this, s))

    s.connect(port, host, () => {
      log.info(s.address(), 'connected server')
    })
  }

  init (socket) {
    if (!this.#socket) this.#socket = socket
    socket.setEncoding('binary')
      .setNoDelay(true)
      .setTimeout(3000)

    socket.on('error', this.onError.bind(this, socket))
      .on('end', this.onEnd.bind(this, socket))
      .on('readable', this.onRead.bind(this, socket))
      .on('timeout', this.onTimeout.bind(this, socket))
  }

  onError (socket, err) {
    log.error(socket.address(), err.message)
    socket.destroy()
  }

  onRead (socket) {
    let data
    do {
      data = socket.read()
      if (!data) break

      // log.info({ data, port: socket.remotePort }, 'received data');
    } while (data)
  }

  onTimeout (socket) {
    log.error(socket.address(), 'socket timeout')
    socket.destroy() // 销毁链接
  }

  onEnd (socket) {
    log.error(socket.address(), '对端关闭连接')
  }

  write (data) {
    if (this.#socket.destroyed) return null

    try {
      return this.#socket.write(data)
    } catch (e) {
      log.error(e.message)
      return false
    }
  }

  #socket = null
}

class IOClient{
  connect(port,host='localhost'){
      this.#socket = io(`http://${host}:${port}`, {
          timeout: this.#timeout, // 连接超时时间
          reconnectionAttempts: 5, // 重连次数 过多会导致，服务故障期不能重启
          path: '/io',
          transports:['websocket'],
          query:{name:'libz',age:18}, // 业务层参数
          auth:{token:'data'}, // 创建链接时校验玩家身份
          extraHeaders:{ // 扩展的 header, 可以用于网关签名校验
              appid:'ffa',
              sign: ''
          },
          perMessageDeflate:{threshold:512} // 太小的消息不压缩
      })

      this.init();
  }

  init(){
      // 首次连接和重连时都会调用
      this.#socket.on('connect', async()=>{
        this.request({mid:'game/123'},(err,data)=>{
          if(err) return log.error({message: err.message})

          this.push(Object.assign(data, {mid:'game/456'}))
        })
      })

      this.#socket.on('push', async(data)=>{
        log.debug(data,'recv push data')
      })

      // 认证中间件断开/业务主动断开，需要手动重连
      this.#socket.on('disconnect', (reason) => {
          log.error({reason}, 'disconnect');
          // if (reason === "io server disconnect") this.#socket.connect();
      });

      this.#socket.on('connect_error', async(err)=>{
        log.error(err.message)
      })

      this.#socket.on('connect_timeout', async()=>{})
      this.#socket.on('reconnect', async(retryTimes)=>{})
      this.#socket.on('reconnecting', async(retryTimes)=>{})
      this.#socket.on('reconnect_error', async(err)=>{})
      this.#socket.on('reconnect_failed', async()=>{})

      // 服务器主动推送的消息
      this.#socket.on('message',async (data)=>{
          console.log(`${this.#socket.id} recv ${data}`)
      })
  }

  push(data){
    if(this.#socket.connected)
        return this.#socket.timeout(this.#timeout).emit('push',data)
  }

  request(data,handler){
      if(typeof handler != 'function')
          throw new Error('handler is not a function')

      if(!this.#socket.connected)
          return handler(new Error('network disconnected'))

      this.#socket.timeout(this.#timeout).send(data, handler)
  }

  #socket = null
  #timeout = 2000;
}

const testTCPClient = async () => {
  const sleep = async ms => await new Promise((resolve) => setTimeout(() => { resolve() }, ms))

  const clients = []
  const fn = () => {
    clients.forEach((c) => {
      const retval = c.write('hello nodejs')
      if (retval === null) {
        log.error(c, 'failed send to server')
      }
    })
    setTimeout(fn, 2000)
  }

  setTimeout(fn, 2000)

  for (let i = 0; i < 1; i++) {
    const c = new TCPClient()
    c.connect(8080, '127.0.0.1')
    clients.push(c)
    await sleep(20)
  }
}

if (require.main === module) {
  // testTCPClient();

  const io = new IOClient()
  io.connect(8001)
}

module.exports = {TCPClient, IOClient}
