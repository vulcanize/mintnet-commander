
class Command {
  async run () {
  }
}

class WriteFile extends Command {
  constructor (filename, payload, options) {
    super()

    this.filename = filename
    this.payload = payload
    this.options = options || {}
  }

  async run (node) {
  }
}

class RunCommand extends Command {
  constructor (command, args, options) {
    super()

    this.command = command
    this.args = args
    this.options = options || {}
  }

  async run (node) {
  }
}

class CommandWrapper {
  constructor (command) {
    this.command = command
  }

  async run (node) {
  }
}

module.exports = {
  Command: Command,
  WriteFile: WriteFile,
  RunCommand: RunCommand,
  CommandWrapper: CommandWrapper
}
