const chalk = require('chalk')
const debug = require('debug')('cli:commands')

const commands = [
  require('./start'),
  require('./stop')
]

const setupCommands = (program) => {
  commands.forEach((command) => {
    let progCommand = program
      .command(command.command)
      .description(command.description)

    if (command.options) {
      command.options.forEach((opt) => {
        progCommand.option(opt[0], opt[1])
      })
    }

    progCommand.action(async (...args) => {
      try {
        await command.action(program)(...args)
      } catch (e) {
        debug(e)
        console.log(chalk.red(`Error: ${e.message}`))
      }
    })
  })
}

module.exports = setupCommands
