# Build stage
FROM node:22-alpine AS build

WORKDIR /app
COPY srcs/frontend/package*.json ./
RUN npm install
COPY srcs/frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
