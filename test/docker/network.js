/* eslint-env mocha */

const expect = require('chai').expect
const Docker = require('dockerode')
const helpers = require('../helpers')
const DockerNetwork = require(helpers.getPath('lib/network/docker'))
const MockNode = require('../mock/node')

describe('Docker Network', () => {
  const testOptions = {
    name: 'test-network',
    nodes: 1,
    executable: [{
      name: 'tendermint',
      args: [ 'node' ]
    }],
    docker: {
      dataDir: '/tmp/dataDir',
      image: 'tendermint/tendermint:0.9.0'
    }
  }
  const docker = new Docker()

  let dockerNetwork

  before(async () => {
    // will fail if image doesn't exist
    await docker.getImage(testOptions.docker.image).inspect()

    dockerNetwork = new DockerNetwork(MockNode, testOptions)
  })

  it('should create network', async () => {
    await dockerNetwork.create()

    let network = dockerNetwork.network

    expect(network).to.be.instanceof(Docker.Network)
  })

  it('should setup machines', async () => {
    let setupRan = false
    dockerNetwork.NodeType.setupCommandsMachine = (node) => {
      expect(node).to.be.instanceof(MockNode)
      setupRan = true

      return []
    }

    dockerNetwork.NodeType.nodesReady = (nodes, name) => {
      expect(name).to.equal(testOptions.name)
      expect(nodes.length).to.equal(testOptions.nodes)
      return []
    }

    await dockerNetwork.setupMachines()

    expect(setupRan).to.equal(true)
  })

  after(async () => {
    let testNetwork = await docker.getNetwork(testOptions.name)

    try {
      if (await testNetwork.inspect()) {
        await testNetwork.remove()
      }
    } catch (e) { }
  })
})
