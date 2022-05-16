const { Telegraf } = require('telegraf');
const bot = new Telegraf('5381111345:AAGY3EvoeWgK7__ijYniTbvt6_u8IpuVytg');
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

bot.launch();
