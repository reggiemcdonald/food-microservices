#!/bin/bash

ITEMS=("Flour" "Sugar" "Baking%20Soda" "Baking%20powder" "Butter" "Milk" "Chocolate%20Chips")
IP=""
RUN=false
STRESS=false

while (( "$#" )); do
  case "$1" in
    --run|-r)
      RUN=true
      shift
      ;;
    --stress|-s)
      STRESS=true
      shift
      ;;
    *)
      IP=$1
      shift
      ;;
  esac
done

if [ "$STRESS" == false ] && [ "$RUN" == false ]; then
  RUN=true
fi

if [ -z "$IP" ]; then
  echo "You must specify the IP address of the service"
  exit 1
fi

if [ "$STRESS" == true ]; then
  for i in {1..100}; do
    itemIdx=$(shuf -i 0-6 -n 1)
    echo "Starting call $i for ${ITEMS[$itemIdx]}"
    output=$(curl -s "http://${IP}/api/findItem?itemName=${ITEMS[$itemIdx]}")
  done
else
  while true; do
    itemIdx=$(shuf -i 0-6 -n 1)
    echo "Starting call for ${ITEMS[$itemIdx]}"
    output=$(curl -s "http://${IP}/api/findItem?itemName=${ITEMS[$itemIdx]}")
    sleep 2
  done
fi


