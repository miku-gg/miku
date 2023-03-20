import subprocess
import os
import sys


def main():
    # Start the pnpm servers
    pnpm_process = subprocess.Popen(["pnpm", "start"], shell=True)

    # Start the Python servers
    os.chdir("apps/embeddings-apis/sentence-embedder")
    sentence_embedder_process = subprocess.Popen([sys.executable, "app.py"], shell=True)
    os.chdir("../similarity-search")
    similarity_search_process = subprocess.Popen([sys.executable, "app.py"], shell=True)

    # Wait for the processes to finish
    pnpm_process.wait()
    sentence_embedder_process.wait()
    similarity_search_process.wait()

if __name__ == "__main__":
    main()
