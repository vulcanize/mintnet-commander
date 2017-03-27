GOTOOLS = \
	github.com/Masterminds/glide

.PHONY: default install bin_deps get_tools test

default:
	@echo "Nothing to do by default"

install: get_tools
	glide install
	go get -v ./vendor/github.com/tendermint/tendermint/cmd/tendermint

bin_deps: install
	go install ./vendor/github.com/tendermint/tendermint/cmd/tendermint
	go install ./vendor/github.com/tendermint/ethermint/cmd/ethermint

get_tools:
	go get -u -v $(GOTOOLS)

test:
	./node_modules/mocha/bin/mocha
