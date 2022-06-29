FROM node:14.19.0

WORKDIR /telegram-alerts

COPY ./ ./

COPY folder-to-copy/* /target/path/in/docker/image/

RUN npm install

EXPOSE 3000


CMD [ "node", "src/index.js" ]