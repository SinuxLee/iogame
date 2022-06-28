const log = require('../core/logger')
const Service = require('../core/service')

class Gate extends Service {
  init () {
    const { host, port, id } = this.gateConf
    log.info({ host, port, id })

    // 创建网络服务

    // 初始化消息回调

    setInterval(this.checkUserTimeout.bind(this), 5000)

    log.info('init gate service successfully')
    return true
  }

  start () {
    log.info('start gate service successfully')
  }

  checkUserTimeout () {
    // 检查玩家超时，踢下线
    // gGateUserManager.
  }

  onClientIn (data) {

  }
}

if (require.main === module) {
  const g = new Gate()
  g.init()
}

module.exports = Gate
