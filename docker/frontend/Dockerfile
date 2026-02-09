# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY srcs/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY srcs/frontend/ .

# Build Vue app for production
RUN npm run build

# Production stage - just copy build output
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
