#!/usr/bin/env bash

openssl genrsa -out vulcanize-ads-auto.pem 2048
openssl rsa -in vulcanize-ads-auto.pem -pubout > vulcanize-ads-auto.pub
cat vulcanize-ads-auto.pub | grep -v "^--.*PUBLIC KEY.*--$" | tr -d "\n" > vulcanize-ads-auto.pub.raw
aws --region us-east-1 ec2 import-key-pair --key-name vulcanize-ads-auto-v0 --public-key-material $(cat vulcanize-ads-auto.pub.raw)
aws --region us-west-1 ec2 import-key-pair --key-name vulcanize-ads-auto-v0 --public-key-material $(cat vulcanize-ads-auto.pub.raw)
aws --region us-east-1 kms create-key
aws --region us-west-1 kms create-key

