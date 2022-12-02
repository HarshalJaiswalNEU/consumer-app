#!/bin/bash

FROM node:12 AS build-env
ADD . /consumerapp
WORKDIR /consumerapp
RUN rm -rf node_modules
RUN npm i
CMD ["index.js"]
