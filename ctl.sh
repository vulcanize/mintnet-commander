#!/usr/bin/env bash

cmd=$1

echo $cmd

function which_cmd {
	which $1 &> /dev/null
	if test $? -ne 0; then 
		echo "ERROR: $1 binary not found in path!"
		exit -1
	fi
}

which_cmd aws
echo -e "AWS Version: \c"
aws --version

which_cmd kubectl
echo -e "kubectl Version: \c"
kubectl version --short

which_cmd kops
echo -e "kops Version: \c"
kops version

# aws route53 list_hosted_zones
# aws s3 ls

# kops get cluster

# kops create cluster --cloud=aws --zones=us-west-1c --name=uswest1.vulcanize.io
# kops edit cluster uswest1.vulcanize.io --yes
# kops update cluster uswest1.vulcanize.io --yes
# ...
# kubectl get nodes
# kubectl create -f https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml
# kubectl proxy --port=8080 &
# ...
# kops delete cluster --name=uswest1.vulcanize.io --yes

echo "exiting normally."
