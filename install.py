import subprocess
import sys

def main():
    # Install pnpm and lerna dependencies
    subprocess.run(["npm", "install", "-g", "pnpm"], shell=True)
    subprocess.run(["pnpm", "install"], shell=True)

    # Install Python dependencies
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "apps/embeddings-apis/sentence-embedder/requirements.txt"], shell=True)
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "apps/embeddings-apis/similarity-search/requirements.txt"], shell=True)

if __name__ == "__main__":
    main()
