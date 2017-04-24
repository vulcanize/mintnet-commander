/* eslint-env mocha */
const expect = require('chai').expect
const helpers = require('../helpers')
const Node = require(helpers.getPath('lib/node/node'))
const TendermintNode = require(helpers.getPath('lib/node/tendermint'))
const Commands = require(helpers.getPath('lib/commands/commands'))

describe('Tendermint Node', () => {
  it('should be Node', () => {
    let tendermint = new TendermintNode()

    expect(tendermint).to.be.instanceof(Node)
  })

  it('should have static events', () => {
    expect(typeof TendermintNode.setupCommandsMachine).to.equal('function')
    expect(typeof TendermintNode.nodesReady).to.equal('function')
  })

  it('should return commands array on setupCommandsMachine', async () => {
    let node = new Node()
    let commands = await TendermintNode.setupCommandsMachine(node)

    expect(commands).to.be.instanceof(Array)
    commands.forEach((command) => {
      expect(command).to.be.instanceof(Commands.Command)
    })
  })

  it('should create writeFile command for priv_validator', async () => {
    let node = new Node()
    let commands = await TendermintNode.setupCommandsMachine(node)
    let writeFile = commands[0]

    expect(writeFile).to.be.instanceof(Commands.WriteFile)
    expect(writeFile.filename).to.equal('priv_validator.json')

    let payload = writeFile.payload

    let props = [ 'address', 'priv_key', 'pub_key' ]
    props.forEach((prop) => expect(payload).to.have.property(prop))

    expect(node.getData('tendermintKey')).to.equal(payload)
  })

  it('should return commands array for each machine on nodesReady', async () => {
    let node = new Node()

    await TendermintNode.setupCommandsMachine(node)

    let nodes = await TendermintNode.nodesReady([ node ], 'network')

    expect(nodes).to.be.instanceof(Array)
    nodes.forEach((node) => {
      expect(node).to.be.instanceof(Array)
      node.forEach((command) => expect(command).to.be.instanceof(Commands.Command))
    })
  })
})
