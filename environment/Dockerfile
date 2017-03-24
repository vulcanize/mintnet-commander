# Pull base image.
FROM golang:1.8

# Grab deps (jq, hexdump, xxd, killall)
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    jq bsdmainutils vim-common psmisc

ENV REPO $GOPATH/src/github.com/tendermint/ethermint

WORKDIR $REPO
COPY . $REPO

RUN go install github.com/tendermint/ethermint/cmd/ethermint

EXPOSE 46656
EXPOSE 46657
EXPOSE 8545
