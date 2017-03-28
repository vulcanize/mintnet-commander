#!/usr/bin/env bash
set -eu

DOCKER_IMAGE=$1
NETWORK_NAME=$2


echo "Creating docker network"
docker network create --driver bridge --subnet 172.57.0.0/16 $NETWORK_NAME

N=$3
seeds="$(scripts/ip.sh 1):46656"
for i in `seq 2 $N`; do
	seeds="$seeds,$(scripts/ip.sh $i):46656"
done

echo "Seeds: $seeds"

for i in `seq 1 $N`; do
  bash scripts/peer.sh $DOCKER_IMAGE $NETWORK_NAME $i $seeds &
done

wait
