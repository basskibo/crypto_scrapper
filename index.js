const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const helper_methods = require("./src/helper_method");
const app = express();
const config = require("./config/config");
const newspapers = config.newspapers;

const availableProviders = newspapers.map((provider) => provider.name);

const articles = [];
let NEWS_ALL = [];

setInterval(async () => {
  console.log("**************************************");
  console.log("Fetching data .....");
  console.log("**************************************");
  NEWS_ALL = await helper_methods.getNewsFromAllProviders(newspapers);
}, 300 * 1000);

app.get("/", (req, res) => {
  res.json("Welcome to the Crypto API !");
});

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

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
