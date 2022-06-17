const cheerio = require('cheerio');
const axios = require('axios');

async function checkLaRuinaTickets(cityToLookForTickets) {
  const { data } = await axios.get('https://laruinashow.com/');
  const $ = cheerio.load(data);
  const rawListOfCities = $('tbody')
    .find('tr')
    .toArray()
    .map(element => $(element).text());

  const listOfCities = rawListOfCities.filter(element => element.toLowerCase().includes('temporada') === false);

  const selectedCityIndex = listOfCities.map(city => city.toLowerCase().includes(cityToLookForTickets)).indexOf(true);

  const buyTicketButtons = $('tbody')
    .find('img')
    .toArray()
    .map(element => $(element).attr('src'));

  const ticketsAvailable = buyTicketButtons[selectedCityIndex].toLowerCase().includes('compra');

  if (ticketsAvailable === true) {
    const buyTicketsTableCells = $('tbody').find('td[class*="right"]').toArray();

    const linksToBuyTickets = buyTicketsTableCells.map(element =>
      $(element)
        .find('a')
        .toArray()
        .map(element => $(element).attr('href'))
    );

    return {
      date: listOfCities[selectedCityIndex].split(/(?=[A-Z])/)[0],
      link: linksToBuyTickets[selectedCityIndex].toString()
    };
  } else return undefined;
}

exports.checkLaRuinaTickets = async function (cityToLookForTickets) {
  return checkLaRuinaTickets(cityToLookForTickets);
};

exports.checkGame = async function (gameLink, limitPrice) {
  const { data } = await axios.get(gameLink);
  const $ = cheerio.load(data);
  const priceSelector = "#tp_price_block_total_price_ww span[class*='offscreen']";
  const rawPrice = $(priceSelector).text();

  const originalResultWithoutCurrency = Number(rawPrice.split(' ')[0].split(',')[0]);
  return originalResultWithoutCurrency <= limitPrice;
};

exports.checkTsushima = async function () {
  return checkTsushima();
};

async function checkTsushima() {
  const link = 'https://store.playstation.com/es-es/product/EP9000-CUSA13323_00-GHOSTDIRECTORCUT';
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);
  const priceSelector = "span[data-qa*='finalPrice']";
  const rawPrice = $(priceSelector).text();
  const priceArray = rawPrice.split(' ')[0].split(',');
  const price = parseFloat(`${priceArray[0]}.${priceArray[1]}`);
  if (price <= 22) return link;
  else return undefined;
}
