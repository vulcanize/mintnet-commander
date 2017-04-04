
class DockerMachine {
  constructor (ip, dir, NodeType) {
    this.ip = ip
    this.directory = dir

    this.ports = NodeType.getPorts()
    this.NodeType = new NodeType()
  }
}

module.exports = DockerMachine
