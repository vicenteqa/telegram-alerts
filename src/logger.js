const moment = require('moment');

function log(msg, user) {
  console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ': ' + user + msg);
}
