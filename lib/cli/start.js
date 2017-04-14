const fs = require('fs-promise')
const yaml = require('js-yaml')
const TendermintBase = require('../node/tendermintBase')
const DockerNetwork = require('../network/docker')

const start = async (configFile) => {
  let yamlConfig = await fs.readFile(configFile)
  let configs = yaml.safeLoad(yamlConfig)

  let network = new DockerNetwork(TendermintBase, configs)

  await network.create()
  await network.setupMachines()
  await network.start()
}

module.exports = {
  description: 'Start the newtork',
  command: 'start <file>',
  action: start
}
