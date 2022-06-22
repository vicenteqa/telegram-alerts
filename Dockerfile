FROM node:14.19.0

WORKDIR /telegram-alerts

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "node", "src/index.js" ]