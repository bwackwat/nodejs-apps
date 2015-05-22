#!/bin/bash

killall node

# build stuff

node /opt/apps/app-initializer.js &

sleep 3
clear
ls