const log = require('../src/core/logger')

test('Logger TestCase', () => {
  expect(log.level).toBe('trace')

  log.level = 'debug'
  expect(log.level).toBe('debug')

  if (global.JEST_ENABLE_LOG) {
    log.trace('trace log')
    log.debug('debug log %s %s %s', 'with', 'a', 'message')
    log.info({ hello: 'world' }, 'info log')
    log.error('error log')
    log.fatal('fatal log')
  }
})
