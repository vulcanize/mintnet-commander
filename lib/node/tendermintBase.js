const commands = require('../commands/commands')
const TendermintNode = require('./tendermint')

class TendermintBaseNode extends TendermintNode {
  // event:setupCommandsMachine
  static async setupCommandsMachine (node) {
    let runCommands = await TendermintNode.setupCommandsMachine(node)
    let artifacts = node.getData('configs').artifacts

    artifacts.forEach((artifact) => {
      runCommands.push(new commands.WriteFile(artifact.filename, artifact.contents, {
        skipExists: true
      }))
    })

    return runCommands
  }

  // event:machinesReady
  static async nodesReady (nodes, networkName) {
    let nodeCommands = await TendermintNode.nodesReady(nodes, networkName)

    nodes.forEach((node, i) => {
      let setupCmds = node.getData('configs').commands.machineSetup
      let root = node.getData('root')

      setupCmds.forEach((cmd) => {
        nodeCommands[i].push(new commands.RunCommand('bash', [
          '-c',
          cmd
        ], {
          env: {
            DATADIR: root,
            PATH: process.env.PATH
          }
        }))
      })
    })

    return nodeCommands
  }
}

module.exports = TendermintBaseNode
