const path = require('path')
const fs = require('fs-promise')
const utils = require('../utils')
const debug = require('debug')('commands:docker')
const commands = require('./commands')

const getCommand = (command) => {
  if (!(command instanceof commands.Command)) {
    return null
  }

  let nodeCommands = [ commands.WriteFile, commands.RunCommand ]
  let dockerCommands = [ DockerWriteFile, DockerRunCommand ]

  let index = nodeCommands.findIndex((Command) => {
    return command instanceof Command
  })

  if (index === -1) {
    return null
  }

  return new dockerCommands[index](command)
}

class DockerWriteFile extends commands.CommandWrapper {
  async run (node) {
    let filepath = path.join(node.getData('root'), this.command.filename)
    let dirname = path.dirname(filepath)

    await fs.mkdirp(dirname)

    if (this.command.options.skipExists) {
      let exists = await fs.exists(filepath)

      if (exists) {
        debug('skipping file')
        return
      }
    }

    debug(`writing to file: ${filepath}`)
    await fs.writeFile(filepath, utils.payloadToString(this.command.payload))
  }
}

class DockerRunCommand extends commands.CommandWrapper {
  async run (node) {
    debug('Running command')
    let run = this.command

    if (!run.options.noCwd) {
      run.options.cwd = node.getData('root')
    }

    debug(`Args: ${run.args}`)
    try {
      await utils.execFile(run.command, run.args, run.options)
    } catch (e) {
      if (!run.options.skipError) {
        throw e
      }

      debug(`skipping error`)
    }
  }
}

module.exports = {
  WriteFile: DockerWriteFile,
  RunCommand: DockerRunCommand,
  getCommand: getCommand
}
