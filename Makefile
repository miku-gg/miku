install:
	./install.sh

run:
	python run.py

pull:
	pnpm pull
	python install.py
	python create_env.py
