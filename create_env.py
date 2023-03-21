import os
import re
import socket
import subprocess
import sys

try:
    from dotenv import load_dotenv
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
    from dotenv import load_dotenv

def get_private_ip():
    hostname = socket.gethostname()
    private_ip = ''
    try:
        ip_list = [ip for ip in socket.getaddrinfo(hostname, None, socket.AF_INET) if not ip[-1][0].startswith('127.')][:1]
        if ip_list:
            private_ip = ip_list[0][-1][0]
    except Exception:
        pass

    if not private_ip:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            private_ip = s.getsockname()[0]
            s.close()
        except Exception:
            pass

    return private_ip

def main():
    load_dotenv()
    env_file_path = os.path.join(os.getcwd(), ".env")
    env_example_file_path = os.path.join(os.getcwd(), ".env.example")
    
    with open(env_example_file_path, "r") as f:
        env_example = f.readlines()
    
    env = {}
    for key in env_example:
        key = key.strip()
        if '=' in key:
            key_name, default_value = key.split('=', 1)
            current_value = os.getenv(key_name)
            if current_value is None and "<" in default_value and ">" in default_value:
                new_value = input(f"Enter value for {key_name} (default: {default_value}): ")
                if new_value == "":
                    new_value = ""  # Save an empty string if no input is provided
                
                env[key_name] = new_value
            else:
                current_value = current_value if current_value is not None else default_value
                if "localhost" in current_value:
                    current_value = current_value.replace("localhost", get_private_ip())

                env[key_name] = current_value if current_value is not None else default_value

    with open(env_file_path, "w") as f:
        for key, value in env.items():
            f.write(f"{key}={value}\n")

    browser_chat_env_file_path = os.path.join(os.getcwd(), "apps", "browser-chat", ".env")
    with open(browser_chat_env_file_path, "w") as f:
        for key, value in env.items():
            f.write(f"{key}={value}\n")


if __name__ == "__main__":
    main()