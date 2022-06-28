FROM node:14.19.0

WORKDIR /telegram-alerts

COPY /home/pi/code/telegram-alerts /telegram-alerts

EXPOSE 3000

RUN npm install

COPY . .

CMD [ "node", "src/index.js" ]