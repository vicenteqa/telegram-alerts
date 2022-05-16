const { Telegraf } = require('telegraf');
const token = require('./config').token;
const bot = new Telegraf(token);
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

const checkLaRuinaTickets = require('./helpers').checkLaRuinaTickets;
const checkGame = require('./helpers').checkGame;

let ruinaJob;
let amazonJob;

bot.command('alertasRuina', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, 'Alertas Ruina: Activadas', {});

  ruinaJob = schedule.scheduleJob('*/10 * * * * *', () => {
    checkLaRuinaTickets('valencia').then(result => {
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
  bot.telegram.sendMessage(ctx.chat.id, 'Alertas Amazon: Activadas', {});

  amazonJob = schedule.scheduleJob('*/10 * * * * *', () => {
    const games = JSON.parse(fs.readFileSync(path.join(__dirname, 'amazonGames.json'), 'UTF-8'));

    games.map(game => {
      checkGame(game.link, game.limitPrice).then(result => {
        if (result === true) {
          bot.telegram.sendMessage(ctx.chat.id, game.name + ' ha bajado de precio, cómpralo aquí: ' + game.link, {});
        }
      });
    });
  });
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
  const msg = 'Alertas Amazon: Desactivadas';
  bot.telegram.sendMessage(ctx.chat.id, msg, {});

  if (amazonJob) {
    amazonJob.cancel();
    console.log(msg);
  }
});

// bot.on('text', ctx => ctx.reply('Default reply'));

bot.command('addProd', ctx => {
  const splittedArguments = ctx.message.text.split('#');
  const link = splittedArguments[1];
  const price = splittedArguments[2];
  const name = link.split('/')[3];

  const games = JSON.parse(fs.readFileSync(path.join(__dirname, 'amazonGames.json'), 'UTF-8'));

  games.push({ name: name, link: link, limitPrice: price });

  fs.writeFileSync(path.join(__dirname, 'amazonGames.json'), JSON.stringify(games), 'UTF-8');

  bot.telegram.sendMessage(
    ctx.chat.id,
    'Product ' + link + ' added to watchlist at limit price of ' + price + "€, we'll let you know if lowers its price",
    {}
  );
});

bot.command('myName', ctx => {
  bot.telegram.sendMessage(ctx.chat.id, 'My name is ' + ctx.from.first_name, {});
});

bot.launch();
