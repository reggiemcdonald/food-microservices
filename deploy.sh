#!/bin/bash

################# deploy.sh #################
# Deploys each microservice as a pod to an
# existing kubernetes cluster
############################################

deployments=( food-finder food-item-lookup food-supplier food-vendor )

# Check for required environment variables
if [ -z "$PROJECT_ID" ]; then
  echo "PROJECT_ID must be defined"
  exit 1
fi

# Get args
#
# $1 <- the host of the container registry
# $2 <- the image tag
HOST=$1
TAG=$2

if [ ! -d deployments/ ]; then
  echo "missing deployments folder"
  exit 1
fi

for deployment in ${deployments[@]}; do
  echo "Now deploying ${deployment}..."
  sleep 5
  export IMAGE_NAME="${HOST}/${PROJECT_ID}/${deployment}:${TAG}"
  eval "echo \"$(< deployments/${deployment}.yaml)\"" | kubectl apply -f -
done
