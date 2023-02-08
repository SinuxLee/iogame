const crypto = require("crypto");

/**
 * 网关玩家
 */
class GateUser{
  /**
   * 通过 gid 获取玩家
   * @param {string} gid 
   * @returns {GateUser}
   */
  static getUserById(gid){
      return this.#gidUsers.get(gid)
  }

  /**
   * 通过 socket 获取玩家
   * @param {Socket} socket 
   * @returns {GateUser}
   */
  static getUserBySocket(socket){
      return this.#socketUsers.get(socket)
  }

  /**
   * 创建玩家
   * @param {Socket} socket 
   * @returns {GateUser}
   */
  static createUser(socket){
      const user = new GateUser(socket)
      this.addUser(user)
      return user
  }

  /**
   * @param {GateUser} user 
   */
  static addUser(user){
      this.#gidUsers.set(user.#gid, user)
      this.#socketUsers.set(user.#socket, user)
  }

  /**
   * @param {GateUser} user 
   */
  static delUser(user){
      this.#gidUsers.delete(user.#gid)
      this.#socketUsers.delete(user.#socket)
  }

  /**
   * 广播给所有玩家
   * @param {Object} data 
   */
  static sendToAllUser(data){
    this.#gidUsers.forEach((user)=>{
      if(user) user.send(data)
    })
  }

  constructor(socket){
      const {id=crypto.randomUUID()} = socket
      this.#gid = id
      this.#socket = socket
  }

  send(data){
    if(this.#socket == null) return

    this.#socket.emit('push',data)
  }

  toJSON(){
    return {gid: this.#gid, logined: this.#logined}
  }

  get gid(){return this.#gid}
  /**
   * @param {number} val
   */
  set lastActiveTS(val){this.#lastActiveTS = val}

  #gid = ''; // 网关节点内是唯一
  #socket = null; // 网络连接
  #logined = false; // 登录状态，true-已登录
  #userState = 0; // 玩家当前状态，在大厅/在房间内
  #gameId = 0; // 玩家所在房间的服务编号
  #lastActiveTS = 0; // 最后活跃时间 ms

  static #gidUsers = new Map(); // <string,GateUser>
  static #socketUsers = new Map(); // <Socket,GateUser>
}

// 测试用例
if (require.main === module) {
  for (let i = 0; i < 3000; i++) {
    GateUser.createUser(i)
  }

  for (let i = 0; i < 3000; i++) {
    const user = GateUser.getUserBySocket(i)
    console.log(user.gid)
  }
}

module.exports = GateUser
