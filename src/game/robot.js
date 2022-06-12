const { parse } = require("csv-parse/sync");
const fs = require("fs");
const log = require("../core/logger");

class RobotManager {
  constructor(file) {
    this.#file = file;
  }

  init() {
    if (!this.#load()) return false;
    return this.#watchConfig();
  }

  #watchConfig() {
    fs.watchFile(this.#file, { persistent: false, interval: 3000 }, () => {
      if (!this.#load()) {
        log.error(`failed to reload ${this.#file}`);
        return;
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
      this.#data = parse(content, {
        bom: false,
        columns: true,
        cast:true,
      });
    } catch (e) {
      log.error(e, "failed to parsing csv");
      return false;
    }

    return true;
  }

  printData() {
    this.#data.forEach(val=>{
        log.info(val);
    })
  }

  #file = "";
  #data = null;
}

if (require.main === module) {
    const gRobotManager = new RobotManager("config/robot.csv");
    if(gRobotManager.init()) gRobotManager.printData()
}   

module.exports = RobotManager;
