.PHONY: default install bin_deps


default:
	@echo "Nothing to do by default"

install:
	glide install
	go get -v ./vendor/github.com/tendermint/tendermint/cmd/tendermint

bin_deps: install
	go install ./vendor/github.com/tendermint/tendermint/cmd/tendermint
	go install ./vendor/github.com/tendermint/ethermint/cmd/ethermint
