#!/usr/bin/env bash

cmd=$1

echo $cmd

which aws &> /dev/null
if test $? -ne 0; then 
	echo "ERROR: aws binary not found in path!"
	exit -1
fi

echo -e "AWS Version: \c"
aws --version

export KUBE_AWS_ZONE=us-west-1
export NUM_NODES=4
export MASTER_SIZE=m3.medium
export NODE_SIZE=m3.medium
export AWS_S3_REGION=us-west-1
export AWS_S3_BUCKET=mycompany-kubernetes-artifacts
export KUBE_AWS_INSTANCE_PREFIX=k8s

echo "exiting normally."
