const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const helper_methods = require("./src/helper_method");
const app = express();
const config = require("./config/config");
const cryptoData = require("./data/crypto.json");
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
app.get("/crypto/price", async (req, res) => {
  if (CRYPTO_PRICES.length > 0) {
    console.log("Using cached data");
    res.json(NEWS_ALL);
  } else {
    const keys = config.cryptoKeys;
    console.log(
      `There is no data, fetching from ${cryptoPriceProvider.address}`
    );
    const { data } = await axios.get(cryptoPriceProvider.address);

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
        coin.name = helper_methods.sliceCryptoName(coin);
        coin.circuilatingSupply =
          helper_methods.sliceCryptocircuilatingSupply(coin);
        coin.marketCap = helper_methods.sliceMarketCap(coin);
        cryptos.push(coin);
        console.log(coin);
      }
    });
    res.json(cryptos);
  }
});

app.get("/crypto/top", (req, res) => {
  res.json(cryptoData.top50Currencies);
});

app.get("/crypto/all", async (req, res) => {
  const keys = config.cryptoKeys;
  console.log(`There is no data, fetching from ${cryptoPriceProvider.address}`);
  const { data } = await axios.get(cryptoPriceProvider.address);

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
          if (keyIdx === 1 || keyIdx === 2) {
            coin[keys[keyIdx]] = tdValue;
          }
          keyIdx++;
        });
      coin.name = helper_methods.sliceCryptoName(coin);

      cryptos.push(coin);
      console.log(coin);
    }
  });
  res.json(cryptos);
});

app.get("/crypto/get/:cryptoName", async (req, res) => {
  const keys = config.cryptoKeys;
  const cryptoName = req.params.cryptoName;
  console.log(`There is no data, fetching from ${cryptoPriceProvider.address}`);
  const { data } = await axios.get(cryptoPriceProvider.address);

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
          if (tdValue) {
            coin[keys[keyIdx]] = tdValue;
            keyIdx++;
          }
        });
      coin.name = helper_methods.sliceCryptoName(coin);
      if (cryptoName === coin.name || cryptoName === coin.shortName) {
        cryptos.push(coin);
        console.log(coin);
      }
    }
  });
  res.json(cryptos);
});

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
