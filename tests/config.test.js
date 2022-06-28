const path = require('path')
const Config = require('../src/core/config')

test('Config TestCase', () => {
  const c = new Config(path.join(__dirname, '../config/iogame.toml'))
  expect(c.init()).toBeTruthy()

  if (global.JEST_ENABLE_LOG) {
    c.printData()
  }
})
