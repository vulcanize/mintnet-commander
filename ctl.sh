#!/usr/bin/env bash

cmd=$1

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

if test "$cmd" = "start"; then
	kops create cluster --cloud=aws --zones=us-west-1c --name=vulcanize.io --state s3://test-kops-ads-state-store/
	kops update cluster vulcanize.io --yes --state s3://test-kops-ads-state-store/
	let elapsed=0
	let timeout=600
	echo "Waiting for up to 10min for cluster to spin up..."
	kubectl get nodes &> /dev/null
	while test $? -ne 0; do
		if test $elapsed -gt $timeout; then
			echo "ERROR: Timeout ($elapsed > $timeout) seconds"
			echo "Shutting down..."
			./ctl.sh stop
			exit 1
		fi
		sleep 1
		let elapsed=elapsed+1
		kubectl get nodes &> /dev/null
	done
	kubectl run my-nginx --image=nginx --replicas=1 --port=80
	kubectl expose deployment my-nginx --port=80 --type=LoadBalancer 
elif test "$cmd" = "stop"; then
	kops delete cluster --state s3://test-kops-ads-state-store/ --name vulcanize.io --yes
elif test "$cmd" = "status"; then
	echo "---=== Clusters:"
	kops get cluster --state s3://test-kops-ads-state-store/ &> tmp.log
	if test "No clusters found" = "$(cat tmp.log)"; then
		cat tmp.log
	else
		cat tmp.log
		echo "---=== Nodes:"
		kubectl get nodes -o wide
		echo "---=== Deployments:"
		kubectl get deployments -o wide
		echo "---=== Services:"
		kubectl get services -o wide
	fi
	rm -f tmp.log
fi

# aws route53 list_hosted_zones
# aws s3 ls

# kops get cluster

# kops create cluster --cloud=aws --zones=us-west-1c --name=vulcanize.io --state s3://test-kops-ads-state-store/
# kops edit cluster vulcanize.io
# kops update cluster vulcanize.io --yes --state s3://test-kops-ads-state-store/
# ...
# kubectl get nodes
# kubectl create -f https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml
# kubectl proxy --port=8080 &
# ...
# kubectl run my_nginx --image=nginx --replicas=1 --port=80
# kubectl get pods
# kubectl get deployments
# kubectl expose pod podname --port=80 --name=outname
# kubectl expose deployment my-nginx --port=80 --type=LoadBalancer
# kubectl get services -o wide
# kubectl -o wide --all-namespaces=true get ep
# ---
# kubectl run my-ethermint --image=tendermint/ethermint --replicas=2 --port=22
# ...
# kops delete cluster --state s3://test-kops-ads-state-store/ --name vulcanize.io

echo "exiting normally."
