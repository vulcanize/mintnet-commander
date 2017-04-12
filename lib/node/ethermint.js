const path = require('path')
const utils = require('../utils')
const keythereum = require('keythereum')
const Node = require('./node')
const commands = require('../commands/commands')

class EtheremintNode extends Node {
  constructor (name) {
    super(name)

    this.keys = {}
  }

  static commandArgs (seed) {
    return [
      '--rpc',
      '--rpcapi',
      'personal,eth,net,web3',
      '--rpcaddr',
      this.ip,
      '--rpccorsdomain',
      '*',
      '--datadir',
      '$TMROOT',
      '--seeds',
      seed + ':46656'
    ]
  }

  static getNodeOptions () {
    // 46656, // P2P port
    // 46657  // RPC Endpoint
    return {
      ports: {
        8545: 4000,
        46656: 5000,
        46657: 6000
      },
      entrypoint: 'ethermint',
      image: 'ethermint:vulcan',
      env: [
        'TMROOT=/tmroot/'
      ],
      serverRoot: '/tmroot',
      commandArgs: EtheremintNode.commandArgs
    }
  }

  // events
  // event:setupCommandsMachine
  static async setupCommandsMachine (node) {
    let keys = await EtheremintNode.generateKeys()

    node.setData('keys', keys)

    return [
      new commands.WriteFile('priv_validator.json', keys.tendermintKey, {
        skipExists: true
      }),
      new commands.WriteFile('keystore/key-' + keys.ethermintKey.address, keys.ethermintKey, {
        skipExists: true
      })
    ]
  }

  // event:machinesReady
  static nodesReady (nodes) {
    let tendermintGen = EtheremintNode.generateTendermintGenesis(nodes)
    let ethermintGen = EtheremintNode.generateEthermintGenesis(nodes)

    let nodeCommands = nodes.map((node) => {
      let runCommands = []

      runCommands.push(new commands.RunCommand('ethermint', [ '--datadir', node.getData('root'), 'init' ], {
        skipError: true
      }))

      runCommands.push(new commands.WriteFile('genesis.json', tendermintGen, {
        skipExists: true
      }))

      runCommands.push(new commands.WriteFile('_.json', ethermintGen, {
        skipExists: true
      }))

      runCommands.push(new commands.RunCommand('ethermint', [
        '--datadir',
        node.getData('root'),
        'init',
        path.join(node.getData('root'), '_.json')
      ]))

      return runCommands
    })

    return nodeCommands
  }

  static async generateKeys () {
    return {
      tendermintKey: await EtheremintNode.genPrivValidator(),
      ethermintKey: EtheremintNode.genEthereumKey()
    }
  }

  static async genPrivValidator () {
    let validator = await utils.execFile('tendermint', [ 'gen_validator' ])

    if (validator.stderr.length > 0) {
      throw new Error(`Couldn't create validator: ${validator.stderr}`)
    }

    return JSON.parse(validator.stdout)
  }

  static genEthereumKey () {
    // TODO: define private key and initialization vector sizes in bytes
    let key = keythereum.create()

    // TODO: move password and kdf to options
    return keythereum.dump('1234', key.privateKey, key.salt, key.iv)
  }

  static generateTendermintGenesis (nodes) {
    let validators = nodes.map((node) => {
      return {
        pub_key: node.getData('keys').tendermintKey.pub_key,
        amount: 10,
        name: node.name
      }
    })

    return {
      app_hash: '',
      chain_id: 'test-chain-gMqn9n',
      genesis_time: '0001-01-01T00:00:00.000Z',
      validators: validators
    }
  }

  static generateEthermintGenesis (nodes) {
    let alloc = {}

    nodes.forEach((node) => {
      alloc['0x' + node.getData('keys').ethermintKey.address] = {
        balance: '1000000000000000000000'
      }
    })

    return {
      nonce: '0xdeadbeefdeadbeef',
      timestamp: '0x0',
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      extraData: '0x0',
      gasLimit: '0x8000000',
      difficulty: '0x400',
      mixhash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      coinbase: '0x3333333333333333333333333333333333333333',
      alloc: alloc
    }
  }
}

module.exports = EtheremintNode
