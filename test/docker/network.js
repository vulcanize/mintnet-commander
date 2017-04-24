/* eslint-env mocha */

const expect = require('chai').expect
const Docker = require('dockerode')
const fs = require('fs-promise')
const helpers = require('../helpers')
const DockerNetwork = require(helpers.getPath('lib/network/docker'))
const MockNode = require('../mock/node')

describe('Docker Network', () => {
  const testOptions = {
    name: 'test-network',
    nodes: 1,
    serverRoot: '/tmp/serverRoot',
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

    if (!await fs.exists(testOptions.docker.dataDir)) {
      throw new Error(`Local directory wasn't created: ${testOptions.docker.dataDir}`)
    }
  })

  it('should start machines and run setup', async () => {
    await dockerNetwork.start()

    let machineContainer = dockerNetwork.machines[0].container
    expect(machineContainer).to.be.ok // eslint-disable-line
    let status = await machineContainer.inspect()

    expect(status).to.be.ok // eslint-disable-line
    expect(status.State.Running).to.be.true // eslint-disable-line
  })

  it('should stop the containers', async () => {
    await dockerNetwork.stop()

    let status = dockerNetwork.machines[0].inspect()

    expect(status.State).to.not.be.ok //eslint-disable-line
  })

  it('should remove the container and the network', async () => {
    await dockerNetwork.remove()

    let container = docker.getContainer('machine-0')

    try {
      await container.inspect()
      throw new Error('Docker container wasn\'t removed')
    } catch (e) {
      expect(e.reason).to.equal('no such container')
    }

    let network = docker.getNetwork(testOptions.name)
    try {
      await network.inspect()
      throw new Error('Network wasn\'t not removed')
    } catch (e) {
      expect(e.reason).to.equal('no such network')
    }
  })

  after(async () => {
    let testNetwork = await docker.getNetwork(testOptions.name)
    let container = await docker.getContainer('machine-0')

    try {
      await container.stop()
    } catch (e) {}

    try {
      await container.remove()
    } catch (e) {}

    try {
      if (await testNetwork.inspect()) {
        await testNetwork.remove()
      }
    } catch (e) { }
  })
})
