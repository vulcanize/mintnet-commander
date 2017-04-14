const utils = require('../utils')

const stop = async () => {
  console.log('stopping network')

  await utils.sleep(5000)
  console.log('network stopped')
}

module.exports = {
  description: 'Stop the newtork',
  command: 'stop <file>',
  action: stop
}
