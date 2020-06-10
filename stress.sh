#!/bin/bash

ITEMS=("Flour" "Sugar" "Baking%20Soda" "Baking%20powder" "Butter" "Milk" "Chocolate%20Chips")
IP=$1

if [ -z "$IP" ]; then
  echo "You must specify the IP address of the service"
  exit 1
fi

for i in {1..100}; do
  itemIdx=$(shuf -i 0-6 -n 1)
  echo "Starting call $i for ${ITEMS[$itemIdx]}"
  output=$(curl -s "http://${IP}/api/findItem?itemName=${ITEMS[$itemIdx]}")
  # echo "response is $output"
done