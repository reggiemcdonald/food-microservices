#!/bin/bash

if [ -z "$PROJECT_ID" ]; then
    echo "missing env variable PROJECT_ID"
    exit 1
fi

REPO=$1
VERSION=$2

if [ -z "$REPO" ]; then
    echo "missing or invalid param repo entered"
    exit 1
fi

if [ -z "$VERSION" ]; then
    echo "missing or invalid param version"
    exit 1
fi

docker build -t "${REPO}/${PROJECT_ID}/food-vendor:${VERSION}" -f food-vendor/Dockerfile .
docker build -t "${REPO}/${PROJECT_ID}/food-supplier:${VERSION}" -f food-supplier/Dockerfile .
docker build -t "${REPO}/${PROJECT_ID}/food-item-lookup:${VERSION}" -f food-item-lookup/Dockerfile .
docker build -t "${REPO}/${PROJECT_ID}/food-finder:${VERSION}" -f food-finder/Dockerfile .
