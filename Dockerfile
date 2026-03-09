# Stage 1: Build React app
FROM node:20-bookworm-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG REACT_APP_BACKEND
RUN REACT_APP_BACKEND=$REACT_APP_BACKEND npm run build

RUN npm run build

# Stage 2: Run Express server
FROM node:20-bookworm-slim

WORKDIR /app/production

# Install server deps (copy only production package.json first)
COPY production/package*.json ./
RUN npm install --only=production

# Copy the server source code
COPY production ./

# Copy React build into server's build folder
COPY --from=build /app/build ./build

EXPOSE 3001
CMD ["node", "index.js"]