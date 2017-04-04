const utils = require('../utils')

class EtheremintNode {
  static getPorts () {
    // 46656, // P2P port
    // 46657  // RPC Endpoint

    return {
      8545: 4000 // ethereum port
    }
  }

  async genPrivValidator () {
    let validator = await utils.execFile('tendermint', [ 'gen_validator' ])

    console.log(validator)
  }
}

module.exports = EtheremintNode
