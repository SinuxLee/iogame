const Redis = require('ioredis')
const log = require('../core/logger')

function createRedis (host, port, isCluster) {
  if (isCluster) {
    return new Redis.Cluster([
      {
        host: '127.0.0.1',
        port: 7000
      },
      {
        host: '127.0.0.1',
        port: 7001
      },
      {
        host: '127.0.0.1',
        port: 7002
      }
    ])
  } else {
    return new Redis({
      host,
      port
    })
  }
}

if (require.main === module) {
  // const log = require("./logger.js");
  // const cli = createRedis('127.0.0.1', 7000, true);

  // cli.set("foo", "bar");
  // cli.get("foo", (err, res) => {
  //   if (err) log.error(err);
  //   else log.info(res);
  // });

  const Redis = require('ioredis')

  const cluster = new Redis.Cluster([
    {
      port: 7000,
      host: '127.0.0.1'
    }
  ])

  cluster.set('foo', 'bar')
  cluster.get('foo', (err, res) => {
    if (err) log.error(err)
    console.log(res)
  })
}

module.exports = createRedis
