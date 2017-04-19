# mintnet-commander

Tools to manage, run and test ABCI Applications.

### Dependencies
Project assumes that you have installed:
  * docker - is used for local deployment
  * nodejs/npm
  * tendermint

### Installation:
  * clone this repo: `git clone https://github.com/vulcanize/mintnet-commander.git`
  * install dependencies: `npm install`
  * you can make it available in $PATH with `npm ln`

### Usage
  There are two commands available right now, `start` and `stop`.
  To start the network first you need to create
[configuration file](https://github.com/vulcanize/mintnet-commander/wiki/Configuration-File). 
  You can start network with `mintnet-commander start -c configFile -n networkFile` command. 
Config file contains data about network. Network file is generated after you run the network and
contains information about each node and machine in the network.  
  To stop the network you need to pass network file only: `mintnet-commander stop -n networkFile`.
