import os
import socket
import subprocess

def get_local_ip():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return local_ip

def main():
    # Install pnpm and lerna dependencies
    subprocess.run(["pnpm", "install"], check=True)

    # Install Python dependencies
    subprocess.run(["pip", "install", "-r", "apps/embeddings-apis/sentence-embedder/requirements.txt"], check=True)
    subprocess.run(["pip", "install", "-r", "apps/embeddings-apis/similarity-search/requirements.txt"], check=True)

if __name__ == "__main__":
    main()
