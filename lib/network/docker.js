const path = require('path')
const fs = require('fs-promise')
const netmask = require('netmask')
const Docker = require('dockerode')
const Netmask = netmask.Netmask

const DockerMachine = require('../machine/docker')
const debug = require('debug')('network:docker')

class DockerNetwork {
  constructor (name, NodeType, options) {
    this.name = name
    this.NodeType = NodeType
    this.options = options
    this.nodes = options.nodes || 5

    if (!options.dataDir) {
      throw new Error('dataDir option must be provided')
    }

    this.dataDir = path.resolve(options.dataDir || './data')

    this.docker = new Docker(options.docker && options.docker.connect)
    this.subnet = new Netmask((options.docker && options.docker.subnet) || '172.57.0.0/16')

    this.machines = null
  }

  async createDataDirectoryStructure () {
    let exists = fs.existsSync(this.dataDir)

    if (exists) {
      debug(`Directory "${this.dataDir}" exists`)
      return
    }

    await fs.mkdirp(this.dataDir)

    let promises = []
    for (let i = 0; i < this.nodes; i++) {
      promises.push(fs.mkdir(path.join(this.dataDir, 'mach-' + i)))
    }

    await Promise.all(promises)
  }

  getIp (index) {
    let first = netmask.ip2long(this.subnet.first)

    if (index > this.subnet.size || index < 0) {
      throw new Error('Index is out of subnet range')
    }

    return netmask.long2ip(first + index)
  }

  getDataDir (index) {
    return path.join(this.dataDir, 'mach-' + index)
  }

  async setupMachines () {
    debug('Creating directory structure')
    await this.createDataDirectoryStructure()

    this.machines = new Array(this.nodes)
    for (let i = 0; i < this.nodes; i++) {
      let ip = this.getIp(i)
      let dir = this.getDataDir(i)
      this.machines[i] = new DockerMachine(ip, dir, this.NodeType)
    }
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
    return await this.network.remove()
  }

  start () {
    console.log('starting network..')
  }

  stop () {
  }
}

module.exports = DockerNetwork
