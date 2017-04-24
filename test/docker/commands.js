/* eslint-env mocha */

const path = require('path')
const fs = require('fs-promise')
const expect = require('chai').expect
const helpers = require('../helpers')
const commands = require(helpers.getPath('lib/commands/commands'))
const dockerCommands = require(helpers.getPath('lib/commands/docker'))
const MockNode = require('../mock/node')

describe('Docker Commands', () => {
  it('should return DockerWriteFile for WriteFile command', () => {
    let writeFile = new commands.WriteFile('file', 'payload')
    let dockerCmd = dockerCommands.getCommand(writeFile)

    expect(dockerCmd).to.be.instanceof(dockerCommands.WriteFile)
  })

  it('should return DockerRunCommand for RunCommand command', () => {
    let runCommand = new commands.RunCommand('echo', [ '123' ])
    let dockerCmd = dockerCommands.getCommand(runCommand)

    expect(dockerCmd).to.be.instanceof(dockerCommands.RunCommand)
  })

  describe('Write File', () => {
    let root = '/tmp/mintnet-test'
    let filename = 'file'
    let fpath = path.join(root, filename)
    let node = new MockNode()

    node.setData('root', root)

    afterEach(async () => {
      if (await fs.exists(fpath)) {
        await fs.unlink(fpath)
      }
    })

    it('should create file in the root folder(locally)', async () => {
      let payload = 'payload'
      let writeFile = new commands.WriteFile(filename, payload)
      let dockerCmd = dockerCommands.getCommand(writeFile)

      await dockerCmd.run(node)

      let fpath = path.join(root, filename)
      let exists = await fs.exists(fpath)

      expect(exists).to.equal(true)

      let content = await fs.readFile(fpath)

      expect(content.toString()).to.equal(payload)
    })

    it('should not overwrite when skipExists', async () => {
      let payload1 = 'payload'
      let payload2 = 'payload2'

      let writeFile = new commands.WriteFile(filename, payload1)
      let dockerCmd = dockerCommands.getCommand(writeFile)

      await dockerCmd.run(node)

      writeFile = new commands.WriteFile(filename, payload2, {
        skipExists: true
      })
      dockerCmd = dockerCommands.getCommand(writeFile)

      await dockerCmd.run(node)

      let contents = await fs.readFile(fpath)

      expect(contents.toString()).to.equal(payload1)
    })
  })

  describe('Run Command', () => {
    let root = '/tmp/mintnet-test'
    let node = new MockNode()

    node.setData('root', root)

    it('should execute command', async () => {
      let runCommand = new commands.RunCommand('echo', [ '123' ])
      let dockerCmd = dockerCommands.getCommand(runCommand)
      let response = await dockerCmd.run(node)

      expect(response).to.have.a.property('stdout').equal('123\n')
    })
  })
})
