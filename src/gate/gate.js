const log = require('../core/logger')
const {MixinServer} = require('../core/server')
const Handler = require('./handler')

class Gate {
  constructor (c) {
    this.#conf = c
  }

  init () {
    // 创建网络服务
    this.#server = new MixinServer()
    const h = new Handler()

    // 初始化消息回调
    this.#server.init(h,h,h)

    log.info('init gate service successfully')
    return true
  }

  start () {
    const { host, port, id } = this.gateConf
    log.info({ host, port, id })

    this.#server.startup(port)
    log.info('start gate service successfully')
  }

  get gateConf () { return this.#conf.gate }

  #conf = null
  #server = null
}

if (require.main === module) {
  const Config = require('../core/config')
  const c = new Config('config/iogame.toml')
  c.init()
  
  const g = new Gate(c)
  g.init()
}

module.exports = Gate
