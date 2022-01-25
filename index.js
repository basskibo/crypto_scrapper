const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const helper_methods = require("./src/helper_method");
const app = express();
const config = require("./config/config");
const newspapers = config.newspapers;
const cryptoPriceProvider = config.cryptoPriceProvider;
const availableProviders = newspapers.map((provider) => provider.name);

const articles = [];
let NEWS_ALL = [],
  CRYPTO_PRICES = [];

setInterval(async () => {
  console.log("**************************************");
  console.log("Fetching data .....");
  console.log("**************************************");
  NEWS_ALL = await helper_methods.getNewsFromAllProviders(newspapers);
}, 300 * 1000);

app.get("/", (req, res) => {
  res.json("Welcome to the Crypto API !");
});

/**
 * description Crypto news / NFT
 */
app.get("/news", async (req, res) => {
  if (NEWS_ALL.length > 0) {
    console.log("Using cached data");
    res.json(NEWS_ALL);
  } else {
    NEWS_ALL = await helper_methods.getNewsFromAllProviders(newspapers);
    console.log(
      `Fetch completed, successfully scrapped data from ${NEWS_ALL.length} articles`
    );
    res.json(NEWS_ALL);
  }
});

app.get("/news/provider/:newspaperId", async (req, res) => {
  const newsPaperId = req.params.newspaperId;
  const newspaperProvider = newspapers.filter(
    (newspaper) => newspaper.name == newsPaperId
  )[0];
  if (!newspaperProvider) {
    console.log("ERROR!!!");
    return res.send(
      `Provider with name ${req.params.newspaperId} was not found. Available providers are : ${availableProviders}`
    );
  }
  console.log(newspaperProvider);
  axios
    .get(newspaperProvider.address)
    .then((response) => {
      const payloadJSON = helper_methods.generateArticlePayload(
        response,
        newspaperProvider
      );
      res.json(payloadJSON);
    })
    .catch((err) => console.log(err));
});

/**
 * description CRYPTO PRICES
 */
app.get("/crypto/prices", async (req, res) => {
  if (CRYPTO_PRICES.length > 0) {
    console.log("Using cached data");
    res.json(NEWS_ALL);
  } else {
    console.log(
      `There is no data, fetching from ${cryptoPriceProvider.address}`
    );
    const { data } = await axios.get(cryptoPriceProvider.address);
    const keys = [
      "rank",
      "name",
      "shortName",
      "marketCap",
      "price",
      "circuilatingSupply",
      "volume",
      "Volume / Market Cap",
      "24h%",
      "7d%",
    ];
    const cryptos = [];
    const $ = cheerio.load(data);
    const elemSelector = "table > tbody > tr";

    $(elemSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      const coin = {};
      if (parentIdx < 20) {
        $(parentElem)
          .children()
          .each((children, childElem) => {
            let tdValue = $(childElem).text();
            if (keyIdx === 1 || keyIdx === 6) {
            }
            if (tdValue) {
              coin[keys[keyIdx]] = tdValue;
              keyIdx++;
            }
          });
        cryptos.push(coin);
        console.log(coin);
      }

      //   console.log(parentElem);
    });
    res.json(cryptos);
  }
});

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
