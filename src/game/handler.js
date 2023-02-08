/**
 * 游戏玩法
 */
class GameHandler{
    static #handlers = new Map() // 玩法池
    static #protos = new Map() // 记录 handler 原型
    static Type = Object.freeze({
        unknow: 0,
        landlords: 1,   // 斗地主
    })

    /**
     * 注册原型
     */
    static registerHandler(proto){
        const h = new proto() // 必须是无参构造函数
        const type = h.type()

        if(this.#protos.has(type)) return

        this.#protos.set(type,proto)
        this.#handlers.set(type,[h])
    }

    /**
     * @method 先从池子里拿，池子没有则创建新的
     * @param {number} type 游戏类型
     */
    static createHandler(type){
        const arr = this.#handlers.get(type)
        if(arr != null && arr.length > 0) return arr.pop()

        const proto = this.#protos.get(type)
        if(proto == null) return null

        return new proto()
    }

    /**
     * 缓存handler，避免频繁创建
     * @param {GameHandler} h
     */
    static destroyHandler(h){
        const type = h.type()
        const arr = this.#handlers.get(type)
        if(arr != null) arr.push(h)
    }
    
    static handlerInfo(){
        const data = []
        for(let [k,v] of this.#protos.entries()){
            const l = this.#handlers.get(k).length
            data.push({type:k, class:v.name, size:l})
        }

        return data
    }


    #room = null; // 所在的房间实例

    /**
     * @param {Room} val
     */
    set root(val){this.#room=val}

    /**
     * @method 获取玩法类型
     * @description 标识种类，子类必须重写
     */
    type(){throw new Error('override me');}

    /**
     * @method 玩家断线重连
     * @description 标识种类，子类必须重写
     * @param {User} user 
     */
    onUserReconnect(user){throw new Error('override me');}
}

module.exports = GameHandler
