# This is a Makefile containing a number of helpful commands for running a local blockchain/network.
# The aim is to provide a quick and easy way to iterate during development.
# Usage examples: `make node1`, `make miner1`

node1:
	@echo "Starting Node 1"
	cd ironfish-cli && yarn start:once start \
		-v --name node1 --port 9001 --bootstrap='' --forceMining \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8001 --rpc.tcp.secure \
		--datadir ~/.ironfish-1

miner1:
	@echo "Starting node1 miner"
	cd ironfish-cli && yarn start:once miners:start -t 1 \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8001

node2:
	@echo "Starting Node 2"
	cd ironfish-cli && yarn start:once start \
		-v --name node2 --port 9002 --bootstrap=127.0.0.1:9001 \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8002 --rpc.tcp.secure \
		--datadir ~/.ironfish-2

miner2:
	@echo "Starting node2 miner"
	cd ironfish-cli && yarn start:once miners:start -t 1 \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8002

node3:
	@echo "Starting Node 3"
	cd ironfish-cli && yarn start:once start \
		-v --name node3 --port 9003 --bootstrap=127.0.0.1:9001 --rpc.tcp.secure \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8003 \
		--datadir ~/.ironfish-3

miner3:
	@echo "Starting node3 miner"
	cd ironfish-cli && yarn start:once miners:start -t 1 \
		--rpc.tcp --rpc.tcp.host=127.0.0.1 --rpc.tcp.port=8003

clean:
	@echo "Deleting data dirs for nodes 1, 2, 3"
	rm -rf ~/.ironfish-1 && rm -rf ~/.ironfish-2 && rm -rf ~/.ironfish-3
