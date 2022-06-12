const {Config} = require('../src/core/config')

test('Config TestCase', () => {
    const c = new Config("config/iogame.toml");
    expect(c.init()).toBeTruthy()

    if(global.JEST_ENABLE_LOG){
        c.printData();
    }
})
