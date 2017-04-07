const path = require('path')
const netmask = require('netmask')
const fs = require('fs-promise')
const Docker = require('dockerode')
const Netmask = netmask.Netmask

const Network = require('./network')
const DockerMachine = require('../machine/docker')
const debug = require('debug')('network:docker')

class DockerNetwork extends Network {
  constructor (name, NodeType, options = {}) {
    super()
    this.name = name
    this.NodeType = NodeType
    this.options = options
    this.nodes = options.nodes || 5

    if (!options.dataDir) {
      throw new Error('dataDir option must be provided')
    }

    this.dataDir = path.resolve(options.dataDir || './data')

    this.docker = new Docker(options.docker && options.docker.connect)
    this.subnet = new Netmask((options.docker && options.docker.subnet) || '172.58.0.0/16')

    this.machines = null
  }

  // Implementation of Interface

  async setupMachines () {
    debug('Creating directory structure')
    this.machines = new Array(this.nodes)

    let image = (this.options.docker && this.options.docker.image)
    let setup = []

    for (let i = 0; i < this.nodes; i++) {
      let ip = this.getIp(i)
      let dir = this.getDataDir(i)

      this.machines[i] = new DockerMachine(this.docker, this.NodeType, {
        id: i,
        ip: ip,
        dir: dir,
        image: image
      })
      setup[i] = this.machines[i].setup()
    }

    await Promise.all(setup)
  }

  async create () {
    const opts = this.options.docker || {}

    debug('Create newtork')
    let network = await this.docker.createNetwork({
      Name: this.name,
      Driver: opts.driver || 'bridge',
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

    // Should be run after stop
    await fs.remove(this.dataDir)
  }

  async start () {
    debug('starting machines')
    let startMachines = this.machines.map((machine, id) => {
      return machine.start(this.name)
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
