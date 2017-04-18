const path = require('path')
const netmask = require('netmask')
const fs = require('fs-promise')
const Docker = require('dockerode')
const Netmask = netmask.Netmask

const Network = require('./network')
const DockerMachine = require('../machine/docker')
const debug = require('debug')('network:docker')

class DockerNetwork extends Network {
  constructor (NodeType, options = {}) {
    super()
    this.name = options.name || 'test'
    this.options = options
    this.nodes = options.nodes || 5

    this.NodeType = NodeType
    options.docker = options.docker || {}

    if (!options.docker.dataDir) {
      throw new Error('dataDir option must be provided')
    }

    this.dataDir = path.resolve(options.docker.dataDir)

    let networkOptions = options.docker.network || {}

    if (networkOptions.name) {
      this.name = networkOptions.name
    }

    this.docker = new Docker(networkOptions.connect)
    this.subnet = new Netmask(networkOptions.subnet || '172.58.0.0/16')
    this.driver = networkOptions.driver || 'bridge'

    this.machines = null
    this.machineIps = this.getIps()
  }

  async setupMachines () {
    debug('Creating directory structure')
    this.machines = new Array(this.nodes)

    let image = (this.options.docker && this.options.docker.image)
    let setup = []

    for (let i = 0; i < this.nodes; i++) {
      let ip = this.machineIps[i]
      let dir = this.getDataDir(i)

      this.machines[i] = new DockerMachine(this.docker, this.NodeType, {
        id: i,
        ip: ip,
        dir: dir,
        image: image,
        name: this.name,
        options: this.options,
        ips: this.machineIps
      })
      setup[i] = this.machines[i].setup()
    }

    await Promise.all(setup)

    await DockerMachine.machinesReady(this.NodeType, this.machines)
  }

  async create () {
    debug('Create newtork')
    let network = await this.docker.createNetwork({
      Name: this.name,
      Driver: this.driver,
      IPAM: {
        Driver: 'default',
        Config: [{
          Subnet: `${this.subnet.base}/${this.subnet.bitmask}`
        }]
      }
    })

    debug('Network was created successfully')
    this.network = network

    return network
  }

  async remove () {
    debug('Removing network')
    if (!this.network) {
      throw new Error(`Couldn't find network instance`)
    }

    if (this.machines) {
      let removeMachines = this.machines.map((machine) => {
        return machine.remove()
      })

      debug('removing containers')
      await Promise.all(removeMachines)
    }

    await this.network.remove()
  }

  async reset () {
    debug('reseting network files')

    await fs.remove(this.dataDir)
  }

  async start () {
    debug('starting machines')
    let startMachines = this.machines.map((machine, id) => {
      return machine.start(this.name, this.getIp(1))
    })

    await Promise.all(startMachines)
  }

  async stop () {
    debug('stopping docker network')
    if (!this.machines) {
      return
    }

    let stopMachines = this.machines.map((machine, id) => {
      return machine.stop()
    })

    await Promise.all(stopMachines)
  }

  getNetworkData () {
    let network = {}

    network.options = this.options
    network.machines = this.machines.map((machine) => machine.getMachineData())

    return network
  }

  getIps () {
    let ips = new Array(this.nodes)
    for (var i = 0; i < this.nodes; i++) {
      ips[i] = this.getIp(i)
    }

    return ips
  }

  getIp (index) {
    let first = netmask.ip2long(this.subnet.first)

    if (index > this.subnet.size || index < 0) {
      throw new Error('Index is out of subnet range')
    }

    return netmask.long2ip(first + index + 1)
  }

  getDataDir (index) {
    return path.join(this.dataDir, 'mach-' + index)
  }
}

module.exports = DockerNetwork
