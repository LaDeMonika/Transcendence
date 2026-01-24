#!/bin/bash

cd build
npm ci --omit="dev"
cat /home/node/app/.env >> /home/node/app/build/.env
node bin/server.js
