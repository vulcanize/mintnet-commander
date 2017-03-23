Environment Setup
===

These are scripts that generate data for the whole environment, that includes:
  - tm-genesis.json - Tendermint JSON File with all validators will be copied to the machine dirs
  - eth-genesis.json - Ethereum initial funds and network configs
  - machine-id/priv_validator.json - for each machine
  - machine-id/genesis.json - tendermint generated by tm-genesis and priv_validators

Note: Initial setup will generate everyone as validators.