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
	rm ${ETHERMINT}/Dockerfile.mintnet
	ln ./Dockerfile ${ETHERMINT}/Dockerfile.mintnet
	cd ${ETHERMINT} && docker build -t ethermint:vulcan -f ./Dockerfile.mintnet .
	rm ${ETHERMINT}/Dockerfile.mintnet
