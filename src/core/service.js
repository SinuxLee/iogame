const EventEmitter = require('events')

class Service extends EventEmitter {
  constructor (c) {
    super()
    this.#conf = c
  }

  get gateConf () { return this.#conf.gate }

  #conf
}

module.exports = Service
