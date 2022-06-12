const pino = require("pino");
const dayjs = require("dayjs");

const log = pino({
  level: "trace",
  base: undefined,
  timestamp: () => `,"ts":"${dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")}"`,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

// 测试用例
if (require.main === module) {
  log.level='debug'

  log.trace("trace log");
  log.debug("debug log %s %s %s", "with", "a", "message");
  log.info({ hello: 'world' }, "info log");
  log.error("error log");
  log.fatal("fatal log");
}

module.exports = log;
