const GateUser = require('./user')
const log = require('../core/logger')

/**
 * 消息处理器
 */
class Handler{
  /**
   * 客户端连接成功
   * @param {Object} data 
   * @returns 
   */
  onUsertIn (data) {
    const {socket} = data
    let u = GateUser.getUserBySocket(socket)
    if(u != null){
      log.warn(user,'socket already in gate');
      return
    }

    u = GateUser.createUser(socket)
    log.info({u}, 'user connected')
  }

  /**
   * 客户端断开连接
   * @param {Object} data 
   * @returns 
   */
  onKickUser (data) {
    const {socket} = data
    const u = GateUser.getUserBySocket(socket)
    if(u == null) return

    // TODO: 广播给所有业务服，此玩家掉线了
    GateUser.delUser(u)
    log.info({u},'user disconnected')
  }

  async onPush(data){
    const {socket, server, msg, reply=null} = data
    const u = GateUser.getUserBySocket(socket)
    if(u == null) return log.error({u}, 'recv data, but use is offline')
    
    msg.gid = u.gid
    switch(server){
      case 'gate':
        break
      
      case 'lobby':
        break
      
      default:
        return GateUser.sendToAllUser(msg)
    }
  }

  async onRequest (data){
    const {socket, server, msg, reply=null} = data
    const u = GateUser.getUserBySocket(socket)
    if(u == null) return log.error({u}, 'recv data, but use is offline')

    u.lastActiveTS = Date.now()
    msg.gid = u.gid
    switch(server){
      case 'gate':
        break
      
      case 'lobby':
        break
      
      default:
        return reply == null ? u.send(msg) : reply(msg)
    }
  }
}

module.exports = Handler
