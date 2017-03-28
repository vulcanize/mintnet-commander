MACHINE_COUNT?=4
DATA_DIR?=./data
PWD:=$(shell pwd)
ETHERMINT:=$(GOPATH)/src/github.com/tendermint/ethermint

.PHONY: clean generate

generate:
	@./scripts/generate.sh ${DATA_DIR} ${MACHINE_COUNT}

clean:
	rm -rvf ${DATA_DIR}

docker:
	if [ -f ${ETHERMINT}/Dockerfile.mintnet ]; then rm ${ETHERMINT}/Dockerfile.mintnet; fi
	ln ./Dockerfile ${ETHERMINT}/Dockerfile.mintnet
	cd ${ETHERMINT} && docker build -t ethermint:vulcan -f ./Dockerfile.mintnet .
	rm ${ETHERMINT}/Dockerfile.mintnet

start:
	./scripts/local_testnet_start.sh ethermint:vulcan ethminttest $(MACHINE_COUNT)

stop:
	./scripts/local_testnet_stop.sh ethminttest $(MACHINE_COUNT)
