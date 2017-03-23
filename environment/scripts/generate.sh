#!/usr/bin/env bash

SOURCE=$(dirname ${BASH_SOURCE[0]})

source $SOURCE/helpers.sh

which_cmd node
which_cmd tendermint
which_cmd ethermint

echo -e "Tendermint Version: \c"
tendermint version

# Not available right now
#echo -e "Etheremint Version: \c"
#tendermint version

echo -e "NodeJS Version: \c"
node -v

echo "Pregenerate Test data for machines"
DATADIR=$1
COUNT=$2

echo -e "Machine Count: $1"

for i in `seq 1 $COUNT`; do
  mkdir -p $DATADIR/machine-$i
  ethermint --datadir $DATADIR/machine-$i init
done

node ./scripts/generate_genesis.js ./tm-genesis.json $1 $2


for i in `seq 1 $COUNT`; do
  ethermint --datadir $DATADIR/machine-$i init eth-genesis.json
  cp -r keystore $DATADIR/machine-$i
done
