FROM node:18-slim

WORKDIR /app

# Copy package files first
# Docker caches this layer — npm install only reruns
# when package.json changes, not on every code change
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Set environment for React dev server
ENV CI=false
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0

EXPOSE 3000

CMD ["npm", "start"]