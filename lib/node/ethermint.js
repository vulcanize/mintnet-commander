const utils = require('../utils')
const keythereum = require('keythereum')

class EtheremintNode {
  static getPorts () {
    // 46656, // P2P port
    // 46657  // RPC Endpoint

    return {
      8545: 4000 // ethereum port
    }
  }

  async writeFiles () {
    let ethereumKey = this.genEthereumKey()
    let files = {}

    files['priv_validator.json'] = await this.genPrivValidator()
    files['keystore/key-' + ethereumKey.address] = JSON.stringify(ethereumKey)

    return files
  }

  async genPrivValidator () {
    let validator = await utils.execFile('tendermint', [ 'gen_validator' ])

    if (validator.stderr.length > 0) {
      throw new Error(`Couldn't create validator: ${validator.stderr}`)
    }

    return validator.stdout
  }

  genEthereumKey () {
    // TODO: define private key and initialization vector sizes in bytes
    let key = keythereum.create()

    // TODO: move password and kdf to options
    return keythereum.dump('1234', key.privateKey, key.salt, key.iv)
  }
}

module.exports = EtheremintNode
