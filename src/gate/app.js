const path = require('path')
const log = require('../core/logger')
const Config = require('../core/config')
const Gate = require('./gate')

function main () {
  const conf = new Config(path.join(__dirname, '../../config/iogame.toml'))
  if (!conf.init()) {
    log.fatal("can't initialize config, will exit.")
    process.exit(1)
  }

  const g = new Gate(conf)
  if (!g.init()) {
    log.fatal('gate initialize failed, will exit.')
    process.exit(1)
  }

  g.start()
}

process.on('uncaughtException', function (err) {
  log.fatal(err, 'uncaughtException')
})

process.on('unhandledRejection', (reason, p) => {
  log.fatal({ rejection: p, reason }, 'unhandledRejection')
})

main()
