const fs = require('fs-promise')

const Machine = require('./machine')
const debug = require('debug')('machine:docker')
const dockerCommands = require('../commands/docker')

class DockerMachine extends Machine {
  constructor (docker, NodeType, options) {
    super()
    this.docker = docker
    this.ip = options.ip
    this.id = options.id
    this.directory = options.dir
    this.image = options.image

    this.nodeType = NodeType
    this.node = new NodeType('node-' + this.id)
    this.nodeOptions = NodeType.getNodeOptions()
    this.ports = this.nodeOptions.ports

    this.node.setData('root', this.directory)
  }

  async start (networkName, seed) {
    debug(`Machine start: ${this.id}`)
    let portBindings = {}
    let ports = {}

    Object.keys(this.ports).forEach((key) => {
      let containerPort = key + '/tcp'
      ports[containerPort] = {}
      portBindings[containerPort] = [{
        HostIp: '',
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

      ExposedPorts: ports,
      Env: this.nodeOptions.env,
      Cmd: this.nodeOptions.commandArgs(seed),
      Image: this.image ? this.image : this.nodeOptions.image,
      Entrypoint: [
        this.nodeOptions.entrypoint
      ],
      HostConfig: {
        Binds: [
          this.directory + ':' + this.nodeOptions.serverRoot
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
    await this.container.start()
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

    this.setupDirectories()

    let commands = await this.nodeType.setupCommandsMachine(this.node)

    await DockerMachine.execCommands(commands, this.node)
  }

  async setupDirectories () {
    await fs.mkdirp(this.directory)
  }

  static async machinesReady (NodeType, machines) {
    let nodes = machines.map((mach) => mach.node)
    let commands = await NodeType.nodesReady(nodes)

    console.log(commands)
    let runCommands = nodes.map((node, i) => {
      return DockerMachine.execCommands(commands[i], node)
    })

    await Promise.all(runCommands)
  }

  static async execCommands (commands, node) {
    let execCommands = commands.map((command) => {
      let wrapped = dockerCommands.getCommand(command)

      if (wrapped == null) {
        debug(`Command not found: ${command}`)
      }
      return wrapped.run(node)
    })

    return Promise.all(execCommands)
  }
}

module.exports = DockerMachine
