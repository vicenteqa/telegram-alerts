const cheerio = require("cheerio");
const axios = require("axios");

async function checkLaRuinaTickets(cityToLookForTickets) {
  const { data } = await axios.get("https://laruinashow.com/");
  const $ = cheerio.load(data);
  const listOfCities = $("tbody")
    .find("tr")
    .toArray()
    .map((element) => $(element).text());

  const selectedCityIndex = listOfCities
    .map((city) => city.toLowerCase().includes(cityToLookForTickets))
    .indexOf(true);

  const buyTicketButtons = $("tbody")
    .find("img")
    .toArray()
    .map((element) => $(element).attr("src"));

  const ticketsAvailable = buyTicketButtons[selectedCityIndex]
    .toLowerCase()
    .includes("compra");

  if (ticketsAvailable === true) {
    const buyTicketsTableCells = $("tbody")
      .find('td[class*="right"]')
      .toArray();

    const linksToBuyTickets = buyTicketsTableCells.map((element) =>
      $(element)
        .find("a")
        .toArray()
        .map((element) => $(element).attr("href"))
    );

    return {
      date: listOfCities[selectedCityIndex].split(/(?=[A-Z])/)[0],
      link: linksToBuyTickets[selectedCityIndex].toString(),
    };
  } else return undefined;
}

exports.checkLaRuinaTickets = async function (cityToLookForTickets) {
  return checkLaRuinaTickets(cityToLookForTickets);
};

exports.checkGame = async function (gameLink, limitPrice) {
  const { data } = await axios.get(gameLink);
  const $ = cheerio.load(data);
  const priceSelector =
    "#tp_price_block_total_price_ww span[class*='offscreen']";
  const rawPrice = $(priceSelector).text();

  const originalResultWithoutCurrency = Number(
    rawPrice.split(" ")[0].split(",")[0]
  );
  return originalResultWithoutCurrency <= limitPrice;
};
