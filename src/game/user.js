const events = require('events')

/**
 * 用户，包括选手和观众
 */
class GameUser extends events.EventEmitter{
    static Event = Object.freeze({
        test:'ddd',
    })

    static #gidUsers = new Map(); // <string,GameUser> 关联网关上的玩家
    static #uidUsers = new Map(); // <number,GameUser> 以 uid 为索引的玩家集合

    /**
     * @param {GameUser} user
     * @returns {boolean}
     */
    static addUser(user){
        if(user == null) return false

        this.#gidUsers.set(user.#gid, user)
        this.#uidUsers.set(user.#uid, user)

        return true
    }

    /**
     * @param {GameUser} user
     * @returns {boolean}
     */
    static delUser(user){
        if(user == null) return false

        this.#gidUsers.delete(user.#gid)
        this.#uidUsers.delete(user.#uid)

        return true
    }

    /**
     * 获取指定 uid 的玩家
     * @param {number} uid
     * @returns {GameUser} user
     */
    static getUserByUID(uid){
        return this.#uidUsers.get(uid)
    }

    /**
     * 获取指定 gid 的玩家
     * @param {string} gid
     * @returns {GameUser} user
     */
    static getUserByGID(gid){
        return this.#gidUsers.get(gid)
    }

    #openid = ''; // 第三方平台的账号标识
    #uid = 0;   // 玩家唯一标识
    #gate = 0;  // 网关服务的编号
    #gid = '';   // 玩家在网关内的唯一编号
    #nick = ''; // 昵称
    #gender = 0; // 性别 0-未知; 1-男; 2-女
    #avatar = ''; // 头像

    #ip = ''; // 网络地址
    #location = ''; // 地理位置
    #regTS = 0; // 注册时间
    #lastLoginTS = 0; // 最后登录时间

    #room = null; // 所在的房间实例
    #isOnline = false; // 是否在线

    constructor(){
        super({captureRejections:true})

        this.on(GameUser.Event.test, this.sayHello.bind(this))
    }

    // 捕捉异步回调中的异常
    [events.captureRejectionSymbol](err, event, ...args) {
        console.log('rejection happened for', event, 'with', err.message, ...args);
    }

    get uid(){return this.#uid}
    get gid(){return this.#gid}
    
    /**
     * @param {Room} val 牌桌
     */
    set room(val){this.#room=val}

    toJSON() {
        return { uid: this.#uid, gid: this.#gid };
    }

    isRobot(){return false}

    /**
     * 向玩家发送消息
     * @param {Object} msg
     */
    send(msg){
        console.log({
            mid:1233545, // gate 转发时的专属消息号
            gate: this.#gate,
            gid: this.#gid,
            data: JSON.stringify(msg),
        })
    }

    /**
     * 玩家登录
     * @returns {boolean}
     */
    onLogin(){
        this.#isOnline = true
        if(this.#room == null) return false
        
        return this.#room.onUserReconnect(this)
    }

    onLogout(){
        this.#isOnline = false
    }

    async sayHello(data){
        console.log(data)
        throw new Error('kaboom');
    }
}

if(require.main === module){
    console.log(GameUser.getUserByGID(123))
    console.log(GameUser.getUserByUID(476))

    const u = new GameUser();
    u.emit(GameUser.Event.test,'hello game')
    GameUser.addUser(u)
    console.log(JSON.stringify(GameUser.getUserByUID(0)))

    GameUser.delUser(u)
    console.log(GameUser.getUserByUID(0))
}

module.exports = GameUser
