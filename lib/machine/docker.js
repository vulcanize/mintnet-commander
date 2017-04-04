const path = require('path')
const fs = require('fs-promise')

const debug = require('debug')('machine:docker')

class DockerMachine {
  constructor (ip, dir, NodeType) {
    this.ip = ip
    this.directory = dir

    this.ports = NodeType.getPorts()
    this.node = new NodeType()
  }

  async setup () {
    let files = await this.node.writeFiles()

    await this.writeFiles(files)
  }

  async writeFiles (files) {
    let self = this
    let fileNames = Object.keys(files)
    let createDirectories = fileNames.map((filename) => {
      let dir = path.join(self.directory, path.dirname(filename))

      debug(`create directory: ${dir}`)
      return fs.mkdirp(dir)
    })

    await Promise.all(createDirectories)

    let createFiles = fileNames.map((filename) => {
      let filePath = path.join(self.directory, filename)

      debug(`create file ${filePath}`)
      return fs.writeFile(filePath, files[filename])
    })

    await Promise.all(createFiles)
  }
}

module.exports = DockerMachine
