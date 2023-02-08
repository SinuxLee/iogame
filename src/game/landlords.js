const GameHandler = require ('./handler')

class LandlordsHandler extends GameHandler{
    type(){return GameHandler.Type.landlords}
}

module.exports = LandlordsHandler
