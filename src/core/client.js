const net = require('net')
const log = require('./logger')

class Client {
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

  connect (port, host) {
    const s = new net.Socket()
    this.#socket = s
    s.on('ready', this.init.bind(this, s))

    s.connect(port, host, () => {
      log.info(s.address(), 'connected server')
    })
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

if (require.main === module) {
  (async () => {
    const sleep = async ms => await new Promise((resolve) => setTimeout(() => { resolve() }, ms))

    const clients = []
    const fn = () => {
      clients.forEach((c) => {
        const retval = c.write('hello nodejs')
        if (retval === null) {
          log.error(c, 'failed send to server')
        }
      })
      setTimeout(fn, 200)
    }

    setTimeout(fn, 200)

    for (let i = 0; i < 3000; i++) {
      const c = new Client()
      c.connect(8080, '127.0.0.1')
      clients.push(c)
      await sleep(20)
    }
  })()
}

module.exports = Client
