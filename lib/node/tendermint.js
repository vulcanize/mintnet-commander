const commands = require('../commands/commands')
const utils = require('../utils')
const Node = require('./node')

class TendermintNode extends Node {
  // event:setupCommandsMachine
  static async setupCommandsMachine (node) {
    let key = await TendermintNode.genPrivValidator()

    node.setData('tendermintKey', key)

    return [
      new commands.WriteFile('priv_validator.json', key, {
        skipExists: true
      })
    ]
  }

  // event:machinesReady
  static nodesReady (nodes, networkName) {
    let tendermintGen = TendermintNode.generateTendermintGenesis(nodes, networkName)

    let nodeCommands = nodes.map((node) => {
      let runCommands = []

      runCommands.push(new commands.RunCommand('tendermint', [
        '--datadir',
        node.getData('root'),
        'init'
      ], {
        skipError: true
      }))

      runCommands.push(new commands.WriteFile('genesis.json', tendermintGen, {
        skipExists: true
      }))

      return runCommands
    })

    return nodeCommands
  }

  static async genPrivValidator () {
    let validator = await utils.execFile('tendermint', [ 'gen_validator' ])

    if (validator.stderr.length > 0) {
      throw new Error(`Couldn't create validator: ${validator.stderr}`)
    }

    return JSON.parse(validator.stdout)
  }

  static generateTendermintGenesis (nodes, networkName) {
    let validators = nodes.map((node) => {
      return {
        pub_key: node.getData('tendermintKey').pub_key,
        amount: 10,
        name: node.name
      }
    })

    return {
      app_hash: '',
      chain_id: networkName,
      genesis_time: '0001-01-01T00:00:00.000Z',
      validators: validators
    }
  }
}

module.exports = TendermintNode
