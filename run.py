import subprocess
import os
import sys
import shutil

def main():
    env_file_path = os.path.join(os.getcwd(), ".env")
    # Find the path to the pnpm executable
    pnpm_path = shutil.which("pnpm")
    if not pnpm_path:
        print("pnpm not found. Please make sure it's installed and in the PATH.")
        sys.exit(1)

    # copy env_file_path into browser-chat
    browser_chat_env_file_path = os.path.join(os.getcwd(), "apps", "browser-chat", ".env")
    shutil.copyfile(env_file_path, browser_chat_env_file_path)

    # remove .vite
    browser_chat_vite_cache = os.path.join(os.getcwd(), "apps", "browser-chat", "node_modules", ".vite")
    if os.path.exists(browser_chat_vite_cache):
        shutil.rmtree(browser_chat_vite_cache)

    # Check for --no-services flag
    pnpm_command = [pnpm_path, "start:no-services"] if "--no-services" in sys.argv else [pnpm_path, "start"]

    # Start the pnpm servers
    pnpm_process = subprocess.Popen(pnpm_command)

    # If --no-services flag is not set, start the Python servers
    if "--no-services" not in sys.argv:
        os.chdir("apps/embeddings-apis/sentence-embedder")
        sentence_embedder_process = subprocess.Popen([sys.executable, "app.py"])
        os.chdir("../similarity-search")
        similarity_search_process = subprocess.Popen([sys.executable, "app.py"])
        # Wait for the Python processes to finish
        sentence_embedder_process.wait()
        similarity_search_process.wait()

    # Wait for the pnpm process to finish
    pnpm_process.wait()

if __name__ == "__main__":
    main()
