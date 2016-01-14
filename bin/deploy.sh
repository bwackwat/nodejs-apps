#!/bin/bash

killall nodejs

NODE_ENV="PRODUCTION" HOSTNAME="www.bwackwat.com" nodejs init.js > apps.log &