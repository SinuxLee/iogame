const pino = require('pino')
const dayjs = require('dayjs')
const caller = require('pino-caller')
const path = require('path')

const log = caller(pino({
  level: 'trace',
  base: undefined,
  timestamp: () => `,"ts":"${dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')}"`,
  formatters: {
    level (label) {
      return { level: label }
    }
  }
}), { relativeTo: path.join(path.dirname(__dirname), '..') })

// 测试用例
if (require.main === module) {
  log.level = 'debug'

  log.trace('trace log')
  log.debug('debug log %s %s %s', 'with', 'a', 'message')
  log.info({ hello: 'world' }, 'info log')
  log.error('error log')
  log.fatal('fatal log')
}

module.exports = log
