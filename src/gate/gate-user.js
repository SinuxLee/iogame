const { nanoid } = require('nanoid')

class GateUser {
    constructor(sid){
        this.#uid = nanoid()
        this.#socketId = sid
        this.#lastActive = Date.now()
    }

    /**
     * 给个会话一个标识，保证全局唯一
     */
    get uid(){return this.#uid}

    /**
     * 系统层的 socket 标识，同一台机器中可能会重复使用
     */
    get socketId(){return this.#socketId}

    /**
     * 玩家登录标识，针对那些创建链接后一直不发消息的会话
     */
    get logined(){return this.#logined}

    /**
     * @param {boolean} val
     */
    set logined(val){this.#logined = val}

    /**
     * 玩家的游戏中 局内、局外的状态
     */
    get userState(){return this.#userState}

    /**
     * @param {number} val
     */
    set userState(val){this.#userState = val}

    /**
     * 玩家所在的游戏服编号
     */
    get logicId(){return this.#logicId}

    /**
     * @param {number} val
     */
    set logicId(val){this.#logicId = val}

    toJson(){
        return JSON.stringify(this)
    }

    #uid = ''          // 唯一标识
    #socketId = 0       // 网络连接编号
    #logined = false    // 登录状态
    #userState = 0      // 玩家当前状态
    #logicId = 0        // 玩家在哪个logic上面
    #lastActive = 0     // 最后活跃的时间戳(ms)
}


class GateUserManager{
    /**
     * 根据会话标识获取玩家信息
     * @param {string} uid 会话标识
     * @returns GateUser
     */
    getUserByUUID(uid){
        if(this.#userUuidMap.has(uid)){
            return this.#userUuidMap.get(uid)
        }

        return null
    }

    /**
     * 根据网络标识回去玩家信息
     * @param {number} sid 网络标识
     * @returns GateUser
     */
    getUserBySocketId(sid){
        if(this.#userSocketMap.has(sid)){
            return this.#userSocketMap.get(sid)
        }

        return null
    }

    /**
     * 添加用户
     * @param {GateUser} user 
     */
    addUser(user){
        this.#userUuidMap.set(user.uid, user)
        this.#userSocketMap.set(user.socketId, user)
    }

    /**
     * 删除用户
     * @param {GateUser} user 
     */
    delUser(user){
        if(this.#userUuidMap.has(user.uid)){
            return this.#userUuidMap.delete(user.uid)
        }

        if(this.#userSocketMap.has(user.socketId)){
            return this.#userSocketMap.delete(user.socketId)
        }
    }
  
    /**
     * 根据网络连接创建新用户
     * @param {number} sid 网络标识
     * @returns GateUser
     */
    createUser(sid){
        const user = new GateUser(sid)
        this.addUser(user)
        return user
    }

    static #ins = null
    #userUuidMap = new Map()
    #userSocketMap = new Map()
}

const gGateUserManager = new GateUserManager()

// 测试用例
if (require.main === module){
    for (let i = 0; i < 3000; i++) {
        gGateUserManager.createUser(i)
    }

    for (let i = 0; i < 3000; i++) {
        const user = gGateUserManager.getUserBySocketId(i)
        console.log(user.uid)
    }
}

module.exports = {gGateUserManager, GateUser}
