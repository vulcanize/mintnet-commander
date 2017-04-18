const fs = require('fs-promise')
const util = require('util')
const Machine = require('./machine')
const debug = require('debug')('machine:docker')
const dockerCommands = require('../commands/docker')

class DockerMachine extends Machine {
  constructor (docker, NodeType, options) {
    super()
    this.docker = docker
    this.networkName = options.name
    this.networkOptions = options.options

    this.ip = options.ip
    this.id = options.id
    this.directory = options.dir
    this.env = this.networkOptions.env.slice()
    this.entrypoint = this.networkOptions.docker.entrypoint || this.networkOptions.executable
    this.entrypoint = {
      name: 'bash',
      args: [
        '-c',
        this.entrypoint[0].name + ' ' + this.entrypoint[0].args.join(' ')
      ]
    }

    this.serverRoot = this.networkOptions.serverRoot

    this.ips = options.ips

    this.image = options.image

    this.nodeType = NodeType
    this.node = new NodeType('node-' + this.id)
    this.ports = this.networkOptions.ports
    this.dockerPorts = this.networkOptions.docker.ports

    this.node.setData('root', this.directory)
    this.node.setData('configs', options.options)
  }

  async start (networkName, seed) {
    debug(`Machine start: ${this.id}`)
    let portBindings = {}
    let ports = {}

    Object.keys(this.dockerPorts).forEach((key) => {
      let containerPort = this.ports[key] + '/tcp'
      ports[containerPort] = {}
      portBindings[containerPort] = [{
        HostIp: '',
        HostPort: this.dockerPorts[key] + this.id + ''
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
      Env: this.getEnvVars(),
      Cmd: this.entrypoint.args,
      Image: this.image,
      Entrypoint: [
        this.entrypoint.name
      ],
      HostConfig: {
        Binds: [
          this.directory + ':' + this.serverRoot
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

  getMachineData () {
    let machinePorts = Object.keys(this.dockerPorts)
    let ports = {}

    machinePorts.map((portName) => {
      ports[portName] = `:${this.dockerPorts[portName] + this.id}`
    })

    return {
      containerId: this.container.id,
      machineId: this.id,
      node: this.getNodesData(),
      ports: ports
    }
  }

  getNodesData () {
    let data = util._extend(this.node.data)
    delete data['configs']

    return {
      name: this.node.name,
      data: data
    }
  }

  getEnvVars () {
    this.env.push({
      name: 'IP',
      value: this.ip
    })

    this.ips.forEach((ip, i) => this.env.push({
      name: 'MACHINE_' + i,
      value: ip
    }))

    return this.env.map((ev) => `${ev.name}=${ev.value}`)
  }

  static async machinesReady (NodeType, machines) {
    let nodes = machines.map((mach) => mach.node)
    let commands = await NodeType.nodesReady(nodes, this.networkName)

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
