ARG IMAGE=node:22.22.0-bullseye-slim
#ARG IMAGE=node:24.13.0-trixie

#ARG IMAGE=node:16.13.1-alpine

#FROM $IMAGE AS base
#RUN mkdir -p /home/node/app && chown node:node /home/node/app
#WORKDIR /home/node/app
#USER node
#RUN mkdir tmp

#FROM base AS dependencies
#COPY --chown=node:node srcs/backend/my-adonisjs-app/package*.json /home/node/app/

#RUN npm ci
#COPY --chown=node:node srcs/backend/my-adonisjs-app/* /home/node/app/


#FROM dependencies AS build
#RUN node ace build --ignore-ts-errors


FROM $IMAGE
RUN mkdir -p tmp
RUN mkdir -p /home/node/app && chown 777 /home/node/app
WORKDIR /home/node/app
COPY srcs/backend/package*.json ./
RUN npm ci
COPY srcs/backend/ .
RUN node ace build --ignore-ts-errors

COPY docker/backend/entrypoint.sh .
RUN chmod 777 entrypoint.sh
ENTRYPOINT ["sh", "/home/node/app/entrypoint.sh"]

#WORKDIR /backend
#COPY srcs/backend/adonisjs/* /backend
#COPY docker/backend/entrypoint.sh /backend
#CMD ["sh", "backend/entrypoint.sh"]
#RUN node backend/adonisjs/ace build --ignore-ts-errors
