FROM node:14.19.0

WORKDIR /telegram-alerts

COPY ./* ./

RUN pwd
RUN ls

RUN npm install

EXPOSE 3000


CMD [ "node", "src/index.js" ]