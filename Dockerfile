# Use the official Python base image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy your project files into the container
COPY . /app

# Install Node.js and other necessary packages
RUN apt-get update && apt-get install -y curl gnupg2 lsb-release
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Install Python and Node.js dependencies
RUN python create_env.py
RUN pip install --upgrade pip && pip install -r apps/embeddings-apis/sentence-embedder/requirements.txt
RUN pip install -r apps/embeddings-apis/similarity-search/requirements.txt
RUN pnpm install

# Expose the ports for the services and bot directory
EXPOSE 8484 8585 5173

# Run the application
CMD ["make", "run"]
