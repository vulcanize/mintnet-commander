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

class DockerWriteFile {
  constructor (writeFile) {
    this.writeFile = writeFile
  }

  async run (node) {
    let filepath = path.join(node.getData('root'), this.writeFile.filename)
    let dirname = path.dirname(filepath)

    await fs.mkdirp(dirname)

    debug(`writing to file: ${filepath}`)
    await fs.writeFile(filepath, utils.payloadToString(this.writeFile.payload))
  }
}

class DockerRunCommand {
  constructor (runCommand) {
    this.runCommand = runCommand
  }

  async run (node) {
    debug('Running command')
    let run = this.runCommand

    if (!run.options.noCwd) {
      run.options.cwd = node.getData('root')
    }

    debug(`Args: ${this.args}`)
    try {
      await utils.execFile(run.command, run.args, run.options)
    } catch (e) {
      debug(`error running script: ${e.message}`)
      if (!run.options.skipError) {
        throw e
      }

      debug(`skipping error: ${e.message}`)
    }
  }
}

module.exports = {
  WriteFile: DockerWriteFile,
  RunCommand: DockerRunCommand,
  getCommand: getCommand
}
