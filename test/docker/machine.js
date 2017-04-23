/* eslint-env mocha */

const expect = require('chai').expect
const helpers = require('../helpers')
const Docker = require('dockerode')
const DockerMachine = require(helpers.getPath('lib/machine/docker'))
const MockNode = require('../mock/node')

describe('Docker Machine', () => {
  let docker = new Docker()
  let network, dockerMachine
  let name = 'test-network'
  let imageName = 'tendermint/tendermint:0.9.0'

  before(async () => {
    // will fail if image doesn't exist
    await docker.getImage(imageName).inspect()

    network = await docker.createNetwork({
      Name: name
    })

    dockerMachine = new DockerMachine(docker, MockNode, {
      name: name,
      id: 0,
      dir: '/tmp/' + name,
      image: 'tendermint/tendermint:0.9.0',
      options: {
        serverRoot: '/tmp/test',
        env: [],
        executable: [{
          name: 'tendermint',
          args: [ 'node' ]
        }],
        docker: {}
      }
    })
  })

  it('should create container', async () => {
    await dockerMachine.create(name)

    expect(dockerMachine.container).to.be.instanceof(Docker.Container)

    let status = await dockerMachine.inspect()

    expect(status.State.Status).to.equal('created')
  })

  it('should start created container', async () => {
    await dockerMachine.start(name)

    let status = await dockerMachine.inspect()

    expect(status.State.Status).to.equal('running')
  })

  it('should stop running container', async () => {
    await dockerMachine.stop()

    let status = await dockerMachine.inspect()

    expect(status.State.Status).to.equal('exited')
  })

  it('should remove stopped container', async () => {
    let id = dockerMachine.container.id

    await dockerMachine.remove()

    try {
      let container = await docker.getContainer(id)
      await container.inspect()
      throw new Error('Container exists')
    } catch (e) {
      if (e.message === 'Container exists') {
        throw e
      }

      expect(e.reason).to.equal('no such container')
    }
  })

  after(async () => {
    try {
      let status = await dockerMachine.inspect()

      if (status.State.Running) {
        await dockerMachine.stop()
      }
      await dockerMachine.remove()
    } catch (e) {}

    await network.remove()
  })
})
