#!/bin/bash

git reset --hard
./bin/clear-iptables.sh
git pull
./bin/setup-iptables.sh

chmod u+x ./bin/clear-iptables.sh
chmod u+x ./bin/setup-iptables.sh
chmod u+x ./bin/deploy.sh
chmod u+x ./bin/git.sh