const { Telegraf } = require('telegraf');
const token = require('./config').token;
const bot = new Telegraf(token);
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const checkLaRuinaTickets = require('./helpers').checkLaRuinaTickets;
const checkGame = require('./helpers').checkGame;
const checkTsushima = require('./helpers').checkTsushima;

let ruinaJob;
let amazonJob;
let psJob;

const cronTwiceDay = '0 22,13 * * *'; // every day at 00:00 and 13:00

bot.command('alertasRuina', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, 'Alertas Ruina: Activadas', {});

  ruinaJob = schedule.scheduleJob('*/10 * * * * *', () => {
    checkLaRuinaTickets('barcelona').then(result => {
      if (result !== undefined) {
        bot.telegram.sendMessage(
          ctx.chat.id,
          'Hay tickets disponibles para el: ' + result.date + ' compra entradas aquí: ' + result.link,
          {}
        );
      }
    });
  });
});

bot.command('alertasAmazon', ctx => {
  log(ctx.from.first_name, ' -> Enabled alerts for Amazon');

  bot.telegram.sendMessage(ctx.chat.id, 'Alertas Amazon: Activadas', {});

  amazonJob = schedule.scheduleJob(cronTwiceDay, () => {
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'amazonProducts.json'), 'UTF-8'));

    products.map(product => {
      checkGame(product.link, product.limitPrice).then(result => {
        if (result === true) {
          log(ctx.from.first_name, ' -> Alert displayed for product: ' + product.name);

          bot.telegram.sendMessage(
            ctx.chat.id,
            product.name + ' ha bajado de precio, cómpralo aquí: ' + product.link,
            {}
          );
        }
      });
    });
  });
});

bot.command('alertasPS', ctx => {
  log(ctx.from.first_name, ' -> Enabled alerts for PS Store');

  bot.telegram.sendMessage(ctx.chat.id, 'Alertas PS Store: Activadas', {});

  psJob = schedule.scheduleJob(cronTwiceDay, () => {
    checkTsushima().then(result => {
      if (result !== undefined) {
        log(ctx.from.first_name, ' -> Alert displayed for PS4 Game');

        bot.telegram.sendMessage(ctx.chat.id, 'Ghost of Tsushima ha bajado de precio ' + result, {});
      }
    });
  });
});

bot.command('stopPS', ctx => {
  const msg = 'Alertas PS Store: Desactivadas';
  bot.telegram.sendMessage(ctx.chat.id, msg, {});

  if (ruinaJob) {
    psJob.cancel();
    console.log(msg);
  }
});

bot.command('stopRuina', ctx => {
  const msg = 'Alertas Ruina: Desactivadas';
  bot.telegram.sendMessage(ctx.chat.id, msg, {});

  if (ruinaJob) {
    ruinaJob.cancel();
    console.log(msg);
  }
});

bot.command('stopAmazon', ctx => {
  log(ctx.from.first_name, ' -> wants to stop Amazon Alerts');

  const msg = 'Alertas Amazon: Desactivadas';
  bot.telegram.sendMessage(ctx.chat.id, msg, {});

  if (amazonJob) {
    amazonJob.cancel();
    log(ctx.from.first_name, ' -> stopped Amazon Alerts');
  }
});

bot.command('agregarProd', ctx => {
  const productName = ctx.message.text.split('#')[1].split('/')[3];

  log(ctx.from.first_name, ' -> wants to add product ' + productName + ' to Amazon watch list');

  const newProduct = addProductToWatchList(ctx.message.text);

  log(ctx.from.first_name, ' -> added a product to Amazon watch list');

  bot.telegram.sendMessage(
    ctx.chat.id,
    'Producto ' +
      newProduct.name +
      ' añadido a la lista de alertas, te avisaremos cuando baje de ' +
      newProduct.limitPrice +
      '€',
    {}
  );
});

bot.launch();

function addProductToWatchList(rawProduct) {
  const splittedArguments = rawProduct.split('#');
  const link = splittedArguments[1];
  const price = splittedArguments[2];
  const name = link.split('/')[3];

  const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'amazonProducts.json'), 'UTF-8'));
  const newProduct = { name: name, link: link, limitPrice: price };
  products.push(newProduct);

  fs.writeFileSync(path.join(__dirname, 'amazonProducts.json'), JSON.stringify(products), 'UTF-8');
  return newProduct;
}

const log = (user, msg) => console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ': ' + user + msg);
