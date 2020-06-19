#!/bin/bash

# the environment variable
if [ -z "$PROJECT_ID" ]; then
  echo "PROJECT_ID must be defined"
  exit 1
fi

# the input parameters 
# $1 <- the host container registry
# $2 <- the container tag to push

HOST=$1
TAG=$2

if [ -z "$TAG" ]; then
  echo "required second parameter tag is missing"
  exit 1
fi

dirs=( food-finder food-item-lookup food-supplier food-vendor )

for dir in ${dirs[@]}; do
  docker push "${HOST}/${PROJECT_ID}/${dir}:${TAG}"
done
