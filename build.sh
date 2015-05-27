#!/bin/bash

killall node

# build stuff

node /opt/apps/build-apps.js

node /opt/apps/run-apps.js &

sleep 3
clear
ls
