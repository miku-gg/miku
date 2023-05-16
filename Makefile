install:
	./install.sh

run:
	python3 run.py

pull:
	pnpm pull
	python3 install.py
	python3 create_env.py
