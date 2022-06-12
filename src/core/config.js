const toml = require("toml");
const fs = require("fs");
const log = require("./logger.js");

class Config {
  constructor(file) {
    this.#file = file;
  }

  init() {
    if (!this.#load()) return false;
    return this.#watchConfig();
  }

  #watchConfig() {
    fs.watchFile(this.#file, { persistent: false, interval: 3000 }, () => {
      if(!this.#load()){
        log.error(`failed to reload ${this.#file}`);
        return
      }
    });

    return true;
  }

  #load() {
    if (!fs.existsSync(this.#file)) {
      log.error(`file ${this.#file} does not exist`);
      return false;
    }

    // TODO:  还有其它异常未处理
    const content = fs.readFileSync(this.#file, "utf8");
    if (content === "") {
      log.error(`file ${this.#file} is empty`);
      return false;
    }

    try {
      this.#data = toml.parse(content);
    } catch (e) {
      log.error(e,'failed to parsing toml');
      return false;
    }

    log.level = this.#data.logLevel
    return true;
  }

  printData() {
    log.info(this.#data);
  }

  #file = "";
  #data = null;
}

// 测试用例
if (require.main === module) {
  const c = new Config("config/iogame.toml");
  if (c.init()) c.printData();
}

module.exports = { Config };
