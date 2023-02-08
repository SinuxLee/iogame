// 4 uint16、uint32
const HEAD_SIZE = 12
const sleep = (ms)=> new Promise(resolve=>setTimeout(resolve,ms))

const pack = (obj) => {
    let offset = 0
    let msg = ''
    try {
        msg = JSON.stringify(obj)
    }catch(e) {
        return null
    }

    const total = HEAD_SIZE + msg.length
    const buf = Buffer.alloc(total)

    offset = buf.writeUint16BE(msg.length,offset) // body 长度
    offset = buf.writeUint32BE(Date.now()/1000|0,offset)
    offset = buf.write(msg,HEAD_SIZE)

    return buf
}

const unpack = (buf) => {
    let obj = null
    let offset = 0
    const size = buf.readUint16BE(offset)
    offset += 2
    const time = buf.readUint32BE(offset)
    offset += 4
    // console.log(new Date(time*1000))

    const msg = buf.slice(HEAD_SIZE,HEAD_SIZE+size).toString()
    try {
        obj = JSON.parse(msg)
    }catch(e) {
        // log error
    }

    return obj
}

if(require.main === module){
    const p = {
        name: 'libz',
        age: 30,
    }
    const buf = pack(p)
    console.log(buf)

    const obj = unpack(buf)
    console.log(obj)
    // await sleep(1000)
}
