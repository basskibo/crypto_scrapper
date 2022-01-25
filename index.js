const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
// NFT top sales https://www.nft-stats.com/top-sales/7d
// https://www.nbcnews.com/tech-media
// https://www.theverge.com/tech
// ONLY NFT https://cointelegraph.com/tags/nft - (unstable)
const newspapers = [
  {
    name: "coindesk",
    address: "https://www.coindesk.com/tech",
    urlRootFormation: "https://www.coindesk.com",
  },
  {
    name: "cointelegraph",
    address: "https://cointelegraph.com/tags/nft",
    urlRootFormation: "https://cointelegraph.com",
  },
  {
    name: "bbc",
    address: "https://www.bbc.com/news/technology",
    urlRootFormation: "https://www.bbc.com",
  },
  {
    name: "theguardian",
    address: "https://www.theguardian.com/uk/technology",
  },
  {
    name: "usatoday",
    address: "https://www.usatoday.com/tech",
    urlRootFormation: "https://www.usatoday.com",
  },

  {
    name: "independent",
    address: "https://www.independent.co.uk/tech?CMP=ILC-refresh",
    urlRootFormation: "https://www.independent.co.uk",
  },

  {
    name: "cryptonews",
    address: "https://cryptonews.com",
  },
  {
    name: "thesun",
    address: "https://www.thesun.co.uk/tech/",
    urlRootFormation: "",
    baseUrl: false,
  },
];

const availableProviders = newspapers.map((provider) => provider.name);

const articles = [];
let NFTArticles = [];

function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}

const generateArticles = async (providerArr) => {
  newspapers.forEach((source) => {
    console.log(source);
    axios.get(source.address).then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const searchQuery = source.textSource
        ? `a:contains("${source.textLocation}")`
        : 'a:contains("NFT")';
      console.log(searchQuery);
      $(searchQuery, html).each(function () {
        // title parsing and removing whitespaces
        let title = source.textLocation
          ? $(this).attr(source.textLocation)
          : $(this).text();
        title = title.replace(/^\s+|\s+$/gm, "");
        title = title.replace(/(\r\n|\n|\r)/gm, "");
        // URL generation and formatting
        const url = $(this).attr("href");
        const parsedSource = `${source.address}${url}`;
        const formattedUrl = source.urlRootFormation
          ? `${source.urlRootFormation}${url}`
          : parsedSource;

        NFTArticles.push({ title, url: formattedUrl, source: source.name });
        console.log(NFTArticles);
      });
    });
  });
};
generateArticles();

app.get("/", (req, res) => {
  res.json("Welcome to the Crypto API !");
});

app.get("/news", (req, res) => {
  //   generateArticles(newspapers);
  NFTArticles = removeDuplicates(NFTArticles, "url");
  console.log("Total number of articles found: ", NFTArticles.length);
  res.json(NFTArticles);
});

app.get("/news/provider/:newspaperId", async (req, res) => {
  const newsPaperId = req.params.newspaperId;
  NFTArticles = [];
  const newspaperAddr = newspapers.filter(
    (newspaper) => newspaper.name == newsPaperId
  )[0];
  if (!newspaperAddr) {
    console.log("ERROR!!!");
    return res.send(
      `Provider with name ${req.params.newspaperId} was not found. Available providers are : ${availableProviders}`
    );
  }
  console.log(newspaperAddr);
  axios
    .get(newspaperAddr.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("NFT")', html).each(function () {
        // title parsing and removing whitespaces
        let title = newspaperAddr.textLocation
          ? $(this).attr(newspaperAddr.textLocation)
          : $(this).text();
        title = title.replace(/^\s+|\s+$/gm, "");
        title = title.replace(/(\r\n|\n|\r)/gm, "");
        // URL generation and formatting
        let url = $(this).attr("href");
        let parsedSource = `${newspaperAddr.address}${url}`;
        const formattedUrl = newspaperAddr.urlRootFormation
          ? `${newspaperAddr.urlRootFormation}${url}`
          : parsedSource;

        if (!newspaperAddr.baseUrl) {
          parsedSource = url;
        }

        title = title.replace(/^\s+|\s+$/gm, "");
        title = title.replace(/(\r\n|\n|\r)/gm, "");
        // URL generation and formatting

        NFTArticles.push({
          title,
          url: parsedSource,
          source: newspaperAddr.name,
        });
        console.log(NFTArticles);
      });
      NFTArticles = removeDuplicates(NFTArticles, "url");
      res.json(NFTArticles);
    })
    .catch((err) => console.log(err));

  //   axios.get(newspaperAddr).then((respnse) => {
  //     res.json(newspaperAddr);
  //   });
});

app.listen(PORT, () => {
  console.log("Server listening on port: ", PORT);
});
