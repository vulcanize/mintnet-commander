#!/usr/bin/env bash
set -eu

DOCKER_IMAGE=$1
NETWORK_NAME=$2
ID=$3

set +u
SEEDS=$4
set -u
if [[ "$SEEDS" != "" ]]; then
	SEEDS=" --seeds $SEEDS "
fi

echo "starting tendermint peer ID=$ID"
# start ethermint container on the network

ABSPATH=`pwd`/data/machine-$ID

docker run -d \
  --net=$NETWORK_NAME \
  --ip=$(scripts/ip.sh $ID) \
  --name local_testnet_$ID \
  --entrypoint ethermint \
  -v $ABSPATH:/tmroot \
  -e TMROOT=/tmroot/ \
  -p $((4000+$ID)):8545 \
   $DOCKER_IMAGE --rpc --rpcapi 'personal,eth,net,web3' --rpcaddr '0.0.0.0' --rpccorsdomain '*' --datadir \$TMROOT $SEEDS
