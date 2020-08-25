#!/bin/bash

# Check for environment variables
if [ -z "$PROJECT_ID" ]; then
  echo "PROJECT_ID must be defined"
  exit 1
fi

# Arguments
# $1 <- the host of the container registry 
# $2 <- the tag of the image 
# $3 ... $n <- the services to update 
HOST=$1
TAG=$2

args=( "$@" )

if [ -z "$TAG" ]; then
  echo "missing tag or host"
  exit 1
fi

for ((i=2; i < ${#args[@]}; ++i)); do
  echo "Updating ${args[i]}..."
  sleep 5
  kubectl set image deployment/${args[i]}-deployment ${args[i]}="${HOST}/${PROJECT_ID}/${args[i]}:${TAG}"
done
