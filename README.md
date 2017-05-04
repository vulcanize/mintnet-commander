# mintnet-commander

Tools to manage, run and test ABCI Applications.

### Dependencies
Project assumes that you have installed:
  * docker - is used for local deployment
  * nodejs/npm
  * tendermint

### Installation:
#### via NPM
  * `npm install -g mintnet-commander`
#### Manual
  * clone this repo: `git clone https://github.com/vulcanize/mintnet-commander.git`
  * install dependencies: `npm install`
  * you can make it available in $PATH with `npm ln`

### Usage
  There are two commands available right now, `start` and `stop`.

#### Docker
  `mintnet-commander start` accepts two parameters,
 [configuration file](https://github.com/vulcanize/mintnet-commander/wiki/Configuration-File)
 and networkFile. Network file mustn't exist, it will be created by mintnet-commander.
   It uses docker for local deployment and goes through several steps:  
   * Creates local network
   * Create local Data directory with machine directories inside (in your file system)
   * Runs `setupCommands`(localy right now) against each machine directory. So every command that is run localy should have binary file available localy.
   * Creates docker containers and mounts local directories to `serverRoot` in the containers.
   * Runs the executable or docker entrypoint command after container is up.
   * Generates network file

  `mintnet-commander stop` requires networkFile to stop the newtork,
  it will:
   * stop and remove containers
   * delete network
   * delete local directories

 Network File contains configuration file info and each machine data, that includes Port Mappings and tendermint keys.
