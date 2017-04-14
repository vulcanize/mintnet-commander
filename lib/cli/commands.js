const chalk = require('chalk')
const debug = require('debug')('cli:commands')

const commands = [
  require('./start'),
  require('./stop')
]

const setupCommands = (program) => {
  commands.forEach((command) => {
    program
      .command(command.command)
      .description(command.description)
      .action(async (...args) => {
        try {
          await command.action(...args)
        } catch (e) {
          debug(e)
          console.log(chalk.red(`Error: ${e.message}`))
        }
      })
  })
}

module.exports = setupCommands
