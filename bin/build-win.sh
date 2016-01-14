jshint ./*.js modules/ nodes/ public/ test/

start node init.js
sleep 1
node test/load-tests.js -v

if [ "$1" == "-e2e" ]; then

	node test/selenium-tests.js
  
fi