const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const helper_methods = require("./src/helper_method");
const app = express();
// NFT top sales https://www.nft-stats.com/top-sales/7d
// https://www.nbcnews.com/tech-media
// https://www.theverge.com/tech
// ONLY NFT https://cointelegraph.com/tags/nft - (unstable)

const newspapers = [
  {
    name: "coindesk",
    provider: "Coin Desk",
    address: "https://www.coindesk.com/tech",
    urlRootFormation: "https://www.coindesk.com",
  },
  {
    name: "cointelegraph",
    provider: "Coin Telegraph",
    address: "https://cointelegraph.com/tags/nft",
    urlRootFormation: "https://cointelegraph.com",
  },
  {
    name: "bbc",
    provider: "BBC News",
    address: "https://www.bbc.com/news/technology",
    urlRootFormation: "https://www.bbc.com",
  },
  {
    name: "theguardian",
    provider: "The Guardian",
    address: "https://www.theguardian.com/uk/technology",
  },
  {
    name: "usatoday",
    provider: "USA Today",
    address: "https://www.usatoday.com/tech",
    urlRootFormation: "https://www.usatoday.com",
  },

  {
    name: "independent",
    provider: "The Independent",
    address: "https://www.independent.co.uk/tech?CMP=ILC-refresh",
    urlRootFormation: "https://www.independent.co.uk",
  },

  {
    name: "cryptonews",
    provider: "Crypto News",
    address: "https://cryptonews.com",
  },
  {
    name: "thesun",
    provider: "The Sun",
    address: "https://www.thesun.co.uk/tech/",
    urlRootFormation: "",
    baseUrl: true,
  },
];

const availableProviders = newspapers.map((provider) => provider.name);

const articles = [];
let NFTArticles = [];

setInterval(async () => {
  console.log("**************************************");
  console.log("Fetching data .....");
  console.log("**************************************");
  NFTArticles = await helper_methods.getNewsFromAllProviders(newspapers);
}, 300 * 1000);

app.get("/", (req, res) => {
  res.json("Welcome to the Crypto API !");
});

app.get("/news", async (req, res) => {
  if (NFTArticles.length > 0) {
    console.log("Using cached data");
    res.json(NFTArticles);
  } else {
    NFTArticles = await helper_methods.getNewsFromAllProviders(newspapers);
    console.log(NFTArticles.length);
    console.log("RETURN !!!!!");
    res.json(NFTArticles);
  }
});

app.get("/news/provider/:newspaperId", async (req, res) => {
  const newsPaperId = req.params.newspaperId;
  NFTArticles = [];
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

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
