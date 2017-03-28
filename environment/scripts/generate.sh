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
#ethermint version

echo -e "NodeJS Version: \c"
node -v

echo "Pregenerate Test data for machines"
DATADIR=$1
COUNT=$2

echo -e "Machine Count: $COUNT, Data Directory: $DATADIR"

if [ -d $DATADIR ]; then
  echo "Data directory already exists"
  exit 1
fi

if [ $COUNT -lt 4 ]; then
  echo "Four machines are predetermined under initial_machines directory"
  exit 2
fi

mkdir -p $DATADIR

for i in {1..4}; do
  cp -r initial_machines/* $DATADIR
done

if [ $COUNT -gt 4 ]; then
  for i in `seq 5 $COUNT`; do
    mkdir -p $DATADIR/machine-$i
    ethermint --datadir $DATADIR/machine-$i init
    cp -r keystore $DATADIR/machine-$i
  done
fi

node ./scripts/generate_genesis.js ./tm-genesis.json $1 $2


for i in `seq 1 $COUNT`; do
  ethermint --datadir $DATADIR/machine-$i init eth-genesis.json
done
