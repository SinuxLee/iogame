const net = require('net')
const log = require('./logger')
const uWS = require('uwebsockets.js')
const io = require("socket.io")

class TCPServer {
  constructor (handler = null) {
    this.#handler = handler
    this.#server = net.createServer()
  }

  startup (port = 0) {
    this.#server.on('connection', this.onConnected.bind(this))

    this.#server.listen(port, () => {
      log.info(this.#server.address(), 'opened server')
    })
  }

  onConnected (socket) {
    if(this.#handler == null) return

    this.#handler.onUsertIn({socket})
  }

  #server = null
  #handler = null
}

/**
 * 三合一服务, 适合做网关业务。包含：websocket/socket.io/http
 */
class MixinServer{
  constructor(){
    this.#uws = new uWS.App()
    this.#io = new io.Server({
        pingTimeout: 4000,
        pingInterval: 5000,
        upgradeTimeout: 1000,
        maxHttpBufferSize: 1024 *10,
        path: '/io',
        perMessageDeflate:{threshold:512},
        allowRequest: async(req,fn)=>{ // 校验
          log.debug({header:req.headers, url:req.url})
          fn(null,true)
        },
        cors: {credentials:false, origin: '*'},
        allowEIO3: true // 兼容低版本
    });

    this.#io.attachApp(this.#uws);
  }

  init(ioHandler, httpHandler, wsHandler){
    this.#ioServe = ioHandler
    this.#httpServe = httpHandler
    this.#wsServe = wsHandler

    this.#io.on('connection', this.onIOConnected.bind(this));
    this.#io.use(this.checkToken.bind(this))

    // http 中不允许使用 io/ws 开头的服务名
    this.#uws.any('/*', this.serveHTTP.bind(this));

    /* TODO: 待开放
    this.#uws.ws('/ws/*',{
        upgrade: this.wsUpgrade.bind(this),
        open: this.wsOpen.bind(this),
        message: this.wsData.bind(this),
    })
    */
  }

  async wsUpgrade(res, req, context){
    // 通过 query/header 中参数对请求进行认证
    const data = {data: req.getUrl()}
    res.upgrade(data,
      req.getHeader('sec-websocket-key'),
      req.getHeader('sec-websocket-protocol'),
      req.getHeader('sec-websocket-extensions'),
      context,
    );
  }

  async wsOpen(socket){
    // TODO bind event
  }

  async wsData(socket, data, isBinary){
    log.debug({ws,data,isBinary})
    socket.send(data)
  }

  async serveHTTP(res, req){
    res.onAborted(() => {res.aborted = true;});

    const rsp = await axios.get('http://ffa-game3.diandian.info:2662/ffa/IsOnline_libz',{
        responseType: 'arraybuffer'
    })

    if (!res.aborted) res.writeStatus('200 OK').end(rsp.data);
  }

  async checkToken(socket,next){
    const {headers,query,auth} = socket.handshake

    // if(auth?.token == null){
    //     const err = new Error("not authorized");
    //     err.data = { content: "Please retry later" };
    //     next(err);
    //     return
    // }

    log.debug({headers,query,auth})
    next()
  }

  async onIOConnected (socket) {
    if(this.#ioServe == null) return log.error('ioServe handler is null')

    this.#ioServe.onUsertIn({socket})

    socket.on('disconnect', (reason)=>{
      this.#ioServe.onKickUser({socket, reason})
    })

    socket.on('push', (msg) =>{
      const {mid=''} = msg
      const idx = mid.toString().indexOf('/')
      if(idx === -1) return socket.disconnect();

      const server = mid.substring(0, idx)
      msg.mid = parseInt(mid.substring(idx+1))

      this.#ioServe.onPush({socket, server, msg})
    })

    socket.on('message', async(msg,reply)=>{
      const {mid=''} = msg
      const idx = mid.toString().indexOf('/')
      if(idx === -1) return socket.disconnect();

      const server = mid.substring(0, idx)
      msg.mid = parseInt(mid.substring(idx+1))
      await this.#ioServe.onRequest({socket, server, msg, reply})
    })

    socket.on("error", (err) => {
      if (err?.message === "unauthorized event") {
        log.error('unauthorized event')
        socket.disconnect();
      }
    });
  }

  startup(port=0, host='0.0.0.0'){
    this.#uws.listen(host, port, (listenSocket)=> {
        if(!listenSocket) return log.fatal('failed to startup server')

        const port = uWS.us_socket_local_port(listenSocket);
        log.info(`gateway listen on ${port}`)
        // TODO: 利用 uWS.us_listen_socket_close(listenSocket); 进行优雅停服
    });
  }

  #ioServe = null;
  #httpServe = null; 
  #wsServe = null;
  #uws = null;
  #io = null;
}

if (require.main === module) {
  const s = new TCPServer()
  s.startup(8080)

  const m = new MixinServer()
  m.startup(10086)
}

module.exports = {TCPServer, MixinServer}
