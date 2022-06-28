const net = require('net')
const Client = require('./client')
const log = require('./logger')

class Server {
  constructor (port, handler) {
    this.#port = port
    this.#handler = handler
    this.#server = net.createServer()
  }

  startup () {
    this.#server.on('connection', this.onConnect.bind(this))

    this.#server.listen(this.#port, () => {
      log.info(this.#server.address(), 'opened server')
    })
    setInterval(() => {
      log.info(`client count is ${this.#clients.length}`)
    }, 1000)
  }

  onConnect (socket) {
    const c = new Client()
    c.init(socket)
    this.#clients.push(c)
  }

  #server = null
  #port = 0
  #handler = null
  #clients = []
}

if (require.main === module) {
  const s = new Server(8080, null)
  s.startup()
}
