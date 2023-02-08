const GameUser = require('./user')

/**
 * 对局中的选手
 */
class Player extends GameUser{
    #state = 0; // 玩家状态，online/offline/mandate

    constructor(){
        super()
    }

    toJSON() {
        return { uid: this.uid, gid: '123' };
    }
}

module.exports = Player
