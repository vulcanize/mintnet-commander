const path = require('path')
const fs = require('fs-promise')

const Machine = require('./machine')
const debug = require('debug')('machine:docker')

class DockerMachine extends Machine {
  constructor (docker, NodeType, options) {
    super()
    this.docker = docker
    this.ip = options.ip
    this.id = options.id
    this.directory = options.dir
    this.image = options.image

    this.nodeType = NodeType
    this.ports = NodeType.getPorts()
    this.node = new NodeType()
  }

  async start (networkName) {
    debug(`Machine start: ${this.id}`)
    let portBindings = {}
    let ports = {}
    Object.keys(this.ports).forEach((key) => {
      let containerPort = key + '/tcp'
      ports[containerPort] = {}
      portBindings[containerPort] = [{
        HostIp : '',
        HostPort: this.ports[key] + this.id + ''
      }]
    })

    debug(`creating container`)
    this.container = await this.docker.createContainer({
      name: 'machine-' + this.id,
      AttachStdin: false,
      AttachStdout: false,
      AttachStderr: false,
      Tty: false,
      OpenStdin: false,
      StdinOnce: false,

//      ExposedPorts: ports,
      Env: [
        'TMROOT=/tmroot/'
      ],
      Cmd: [
        '--rpc',
        '--rpcapi',
        'personal,eth,net,web3',
        '--rpcaddr',
        this.ip,
        '--rpccorsdomain',
        '*',
        '--datadir',
        '$TMROOT'
      ],
      Image: 'ethermint:vulcan',
      Entrypoint: [
        this.nodeType.getEntrypoint()
      ],
      HostConfig: {
        Binds: [
          this.directory + ':/tmroot'
        ],
        NetworkMode: networkName,
        PortBindings: portBindings
      },
      NetworkingConfig: {
        EndpointsConfig: {
          [networkName]: {
            IPAMConfig: {
              IPv4Address: this.ip
            }
          }
        }
      }
    })

    debug(`starting container ${this.id}`)
    //await this.container.start({
    //  PortBindings: portBindings
    //})
  }

  async stop () {
    if (!this.container) {
      debug('container not found')
      return
    }

    debug('stopping container')
    return await this.container.stop()
  }

  async remove () {
    if (!this.container) {
      debug("Removing: Couldn't find container")
      return
    }

    debug('Removing container')
    return await this.container.remove()
  }

  async setup () {
    debug(`setting up machine: ${this.id}`)
    await this.node.generateKeys()
    let files = this.node.writeFiles()

    await this.writeFiles(files)
  }

  async writeFiles (files) {
    let self = this
    let fileNames = Object.keys(files)
    let createDirectories = fileNames.map((filename) => {
      let dir = path.join(self.directory, path.dirname(filename))

      let exists = fs.existsSync(dir)

      if (exists) {
        return false
      }

      debug(`create directory: ${dir}`)
      return fs.mkdirp(dir)
    })

    let dirs = await Promise.all(createDirectories)

    let createFiles = fileNames.map((filename, i) => {
      // don't generate files if directories existed already
      if (dirs[i] === false) {
        return
      }

      let filePath = path.join(self.directory, filename)

      debug(`create file ${filePath}`)
      return fs.writeFile(filePath, files[filename])
    })

    await Promise.all(createFiles)
  }
}

module.exports = DockerMachine
