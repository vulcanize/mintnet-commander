
const pkg = require('../../package.json')
const program = require('commander')
const commands = require('./commands')

program.version(pkg.version)

commands(program)

program.parse(process.argv)
