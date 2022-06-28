FROM node:14.19.0

WORKDIR /telegram-alerts

COPY /home/pi/code/telegram-alerts /telegram-alerts

RUN npm install

COPY . .

CMD [ "node", "src/index.js" ]