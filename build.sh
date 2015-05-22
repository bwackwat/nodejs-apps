#!/bin/bash

killall node

# build stuff

node /opt/apps/app-initializer.js &

sleep 1
clear
ls