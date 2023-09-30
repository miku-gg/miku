install:
	./install.sh

run:
ifdef NO_SERVICES
	./env/bin/python3 run.py --no-services
else
	./env/bin/python3 run.py
endif

pull:
	pnpm pull
	./env/bin/python3 install.py
	./env/bin/python3 create_env.py
