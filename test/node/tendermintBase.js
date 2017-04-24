/* eslint-env mocha */
const expect = require('chai').expect
const helpers = require('../helpers')
const Node = require(helpers.getPath('lib/node/node'))
const TendermintBaseNode = require(helpers.getPath('lib/node/tendermintBase'))
const Commands = require(helpers.getPath('lib/commands/commands'))

describe('TendermintBase Node', () => {
  it('should be Node', () => {
    let tendermint = new TendermintBaseNode()

    expect(tendermint).to.be.instanceof(Node)
  })

  it('should have static events', () => {
    expect(typeof TendermintBaseNode.setupCommandsMachine).to.equal('function')
    expect(typeof TendermintBaseNode.nodesReady).to.equal('function')
  })

  it('should accept artifacts on setupCommandsMachine', async () => {
    let node = new Node()

    node.setData('configs', {
      artifacts: [{
        filename: 'hello',
        contents: 'name'
      }]
    })

    let commands = await TendermintBaseNode.setupCommandsMachine(node)
    let command = commands.find((command) => {
      if (!(command instanceof Commands.WriteFile)) {
        return false
      }
      return command.filename === 'hello' && command.payload === 'name'
    })

    expect(command).to.be.instanceof(Commands.WriteFile)
  })

  it('should accept custom commands on nodesReady', async () => {
    let node = new Node()
    let cmd = 'echo 123'
    node.setData('configs', {
      commands: {
        machineSetup: [ cmd ]
      }
    })

    await TendermintBaseNode.setupCommandsMachine(node)

    let nodes = await TendermintBaseNode.nodesReady([node], 'network')

    nodes.forEach((commands) => {
      let echo = commands.find((command) => {
        if (!(command instanceof Commands.RunCommand)) {
          return false
        }

        return command.command === 'bash'
      })

      expect(echo).to.be.instanceof(Commands.RunCommand)
      expect(echo.args[1]).to.equal(cmd)
    })
  })
})
