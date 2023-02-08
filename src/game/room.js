const Code = require('../common/code')

/**
 * 房间，可以容纳多个对局、多名玩家(选手/观众/机器人)
 */
class Room{
    static #usingRooms = new Map(); // 使用中的房间
    static #freeRooms = new Array(); // 空闲中的房间
    
    /**
     * 获取空闲房间
     * @param {number} id
     * @param {number} gameType 游戏类型: 斗地主、麻将、贪吃蛇
     * @param {number} gameStyle 游戏玩法: 二人斗地主、血战麻将、限时贪吃蛇
     * @param {number} gameMode 游戏模式: 普通模式、金币模式、比赛模式、排位模式
     * @returns {Room}
     */
    static getFreeRoom(roomId, gameType, gameStyle){
        if(this.#usingRooms.has(roomId)) return null

        let r = null
        if(this.#freeRooms.length > 0) r = this.#freeRooms.pop();
        else r = new Room()

        if(!r.init(roomId)) return null

        this.#usingRooms.set(roomId,r)
        return r
    }

    /**
     * 获取使用中的房间
     * @param {number} roomId 
     * @returns {Room}
     */
    static getUsingRoom(roomId){
        return this.#usingRooms.get(roomId)
    }

    /**
     * 创建房间
     * @param {Player} player 
     * @param {Object} option 
     * @returns {number} 0: 成功
     */
    static createRoom(player, option){
        const {rid = 0, gameType, gameStyle, robotCount = 0} = option
        let result = Code.OK, room = null;

        do {
            if(player.room != null){result = Code.HasRoom; break;} // 玩家已拥有房间

            if(this.getUsingRoom(rid) != null){result = Code.RoomInUse; break;} // 房间已被占用

            room = this.getFreeRoom(rid, gameType, gameStyle)
            if(room == null){result = 3; break;} // 创建房间失败
        } while (false);
        
        // 设置 Room 选项
        room.setOptions(option)
        room.onEnterRoom(player)
        player.send({msg:123, code:result, rid:room.#rid})

        if(robotCount <= 0) return result;

        // 添加机器人

        return result
    }

    /**
     * 已开的房间数量
     * @returns {number}
     */
    static roomCount(){
        return this.#usingRooms.size
    }

    /**
     * 让玩家进入房间
     * @param {Player} player
     */
    static onEnterRoom(player){
        
    }

    static enterRoom(user, roomId){

    }

    static leaveRoom(user){

    }

    #rid = 0; // 房间编号
    #players = []; // Player
    #state = 0; //房间类型
    #handler = null; // 玩法规则处理器
    #video = null; // 录像管理

    #resetPos = 0; // 申请解散房间玩家位置
    #reset = []; // 解散决策记录
    #resetUser = ''; // 申请的玩家
    #resetTS = 0; // 申请解算的开始时间

    #readyState = []; // 玩家准备状态，全部准备后才能开局
    #options = []; // 玩法选项

    /**
     * 开新房间时进行初始化，不依赖外部变量的参数先初始化
     */
    init(id){
        this.#rid = id
    }

    /**
     * 用外部参数初始化房间的选项
     * @param {Object} opts 
     */
    setOptions(opts){

    }

    createHandler(gameType){
        this.#handler = GameHandler.createHandler(gameType)
        this.#handler.room = this
    }

    /**
     * 玩家断线重连
     * @param {User} user 
     */
    onUserReconnect(user){
        this.#handler.onUserReconnect(user)
    }

    /**
     * 牌桌回收时，清理牌桌
     */
    clear(){

    }
}

module.exports = Room
