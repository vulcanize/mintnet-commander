const fs = require('fs-promise')
const yaml = require('js-yaml')
const chalk = require('chalk')
const TendermintBase = require('../node/tendermintBase')
const DockerNetwork = require('../network/docker')

const start = (program) => {
  return async (cmd) => {
    if (!cmd.config) {
      throw new Error('You must specify config file')
    }

    if (!cmd.network) {
      throw new Error('You must specify network file')
    }

    let yamlConfig = await fs.readFile(cmd.config)
    let configs = yaml.safeLoad(yamlConfig)

    let network = new DockerNetwork(TendermintBase, configs)

    await network.create()
    console.log('network created')
    await network.setupMachines()
    console.log('network setup is done')
    await network.start()
    console.log(chalk.green('network started'))
  }
}

module.exports = {
  description: 'Start the newtork',
  command: 'start',
  options: [
    [ '-c, --config <file>', 'Config file .yaml' ],
    [ '-n, --network <file>', 'Outputs Network file, contains mappings(overwrites)' ]
  ],
  action: start
}
