const fs = require('fs-promise')
const chalk = require('chalk')
const TendermintBase = require('../node/tendermintBase')
const DockerNetwork = require('../network/docker')

const stop = (program) => {
  return async (cmd) => {
    if (!cmd.network) {
      throw new Error('You must specify network file')
    }

    let networkConfigs = JSON.parse(await fs.readFile(cmd.network))
    let network = new DockerNetwork(TendermintBase, networkConfigs.options)

    await network.init(networkConfigs, networkConfigs.machines)

    try {
      await network.stop()
      console.log('network stopped')
    } catch (e) {
      console.log(chalk.red('Error stopping network:', e.message))
    }

    await network.reset()
    console.log('network files were deleted')
    await network.remove()
    console.log('network deleted')

    await fs.unlink(cmd.network)
    console.log('Network file deleted')
  }
}

module.exports = {
  description: 'Stop the newtork',
  command: 'stop',
  options: [
    [ '-n, --network <file>', 'Network file, contains mappings' ]
  ],
  action: stop
}
