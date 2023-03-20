install:
	python install.py
	python create_env.py

run:
	python run.py

pull:
	pnpm pull
	python install.py
	python create_env.py
