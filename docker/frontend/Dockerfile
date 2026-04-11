FROM node:22-alpine AS build

WORKDIR /app
COPY srcs/frontend/package*.json ./
RUN npm ci
COPY srcs/frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
