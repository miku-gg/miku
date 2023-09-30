install:
	./install.sh

run:
	./env/bin/python3 run.py

pull:
	pnpm pull
	./env/bin/python3 install.py
	./env/bin/python3 create_env.py