#!/bin/bash

if [ -z "$PROJECT_ID" ]; then
    echo "missing env variable PROJECT_ID"
    exit 1
fi

REPO=$1
TAG=$2

if [ -z "$REPO" ]; then
    echo "missing or invalid param repo entered"
    exit 1
fi

if [ -z "$TAG" ]; then
    echo "missing or invalid param version"
    exit 1
fi

export REPO=$REPO
export TAG=$TAG
docker-compose build --parallel