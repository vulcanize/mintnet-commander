const utils = require('../utils')

const stop = (program) => {
  return async (cmd) => {
    if (!cmd.network) {
      throw new Error('You must specify network file')
    }

    await utils.sleep(5000)
    console.log('network stopped')
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
