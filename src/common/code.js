const Msg = require('./message')

/**
* make code
* @description code = 消息号 * 100 + 错误号
* @param {number} mid 消息号
* @param {number} id 此消息下的错误号
* @returns {number}
*/
function C(mid,id){
   return mid*100 + id
}

/**
 * 全局错误号 一个模块预留100个错误号
 */
const Code = Object.freeze({
    OK: 0, // 成功

    /* 创建房间 */
    HasRoom: C(Msg.CreateRoom, 1), // 已拥有房间
    RoomInUse: C(Msg.CreateRoom, 2), // 房间被占用
})

if(require.main === module){
    console.log(Code.HasRoom, Code.RoomInUse)
}

module.exports = Code
