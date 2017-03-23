#!/usr/bin/env bash

function which_cmd {
	which $1 &> /dev/null
	if test $? -ne 0; then 
		echo "ERROR: $1 binary not found in path!"
		exit -1
	fi
}
