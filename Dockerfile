FROM node:14.19.0

WORKDIR /telegram-alerts

COPY /* /telegram-alerts/

RUN npm install

EXPOSE 3000 443 88 8443

CMD [ "node", "src/index.js" ]