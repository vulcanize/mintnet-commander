const fs = require('fs')
const path = require('path')

//const genesisPath = 
const genesis = JSON.parse(fs.readFileSync(process.argv[2]))
const dataDir = process.argv[3]
const numMachines = parseInt(process.argv[4])

const machineFolder = (i) => `${dataDir}/machine-${i}`

if (numMachines <= 4) return

for (let i = 5; i <= numMachines; i++) {
  console.log(`Collecting machine-${i}`)
  let privValidatorPubKey = JSON.parse(fs.readFileSync(`${machineFolder(i)}/priv_validator.json`)).pub_key
  let privValidator = {
    "amount": 10,
    "name": `machine-${i}`,
    "pub_key": privValidatorPubKey
  }

  genesis.validators.push(privValidator)
}

for (let i = 1; i <= numMachines; i++) {
  console.log(`Writing genesis for machine-${i}`)
  fs.writeFileSync(`${machineFolder(i)}/genesis.json`, JSON.stringify(genesis))
}

