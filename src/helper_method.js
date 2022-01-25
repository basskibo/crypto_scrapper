const cheerio = require("cheerio");
const axios = require("axios");

const removeDuplicates = (originalArray, prop) => {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
};

const generateArticlePayload = (response, newspaperAddr) => {
  const html = response.data;
  const $ = cheerio.load(html);
  let articles = [];
  $('a:contains("NFT")', html).each(function () {
    // title parsing and removing whitespaces
    let title = $(this).text();
    title = title.replace(/^\s+|\s+$/gm, "");
    title = title.replace(/(\r\n|\n|\r)/gm, "");
    // URL generation and formatting
    let url = $(this).attr("href");
    let parsedUrl = `${newspaperAddr.address}${url}`;
    let formattedUrl = newspaperAddr.urlRootFormation
      ? `${newspaperAddr.urlRootFormation}${url}`
      : parsedUrl;

    if (newspaperAddr.baseUrl) {
      formattedUrl = url;
    }

    title = title.replace(/^\s+|\s+$/gm, "");
    title = title.replace(/(\r\n|\n|\r)/gm, "");
    // URL generation and formatting
    console.log(title);
    articles.push({
      title,
      url: formattedUrl,
      source: newspaperAddr.name,
      provider: newspaperAddr.provider,
    });
  });
  articles = removeDuplicates(articles, "url");

  return articles;
};

const getNewsFromAllProviders = async (newspapers) => {
  let articles = [];

  for (let i = 0; i < newspapers.length; i++) {
    const source = newspapers[i];
    await axios.get(source.address).then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const searchQuery = source.textSource
        ? `a:contains("${source.textLocation}")`
        : 'a:contains("NFT")';
      //   console.log(searchQuery);
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

        articles.push({
          title,
          url: formattedUrl,
          source: source.name,
          provider: source.provider,
        });
        console.log("PUSHING >>>>> ", title);
        articles = removeDuplicates(articles, "url");
      });
    });
  }
  return articles;
};

module.exports = {
  generateArticlePayload: generateArticlePayload,
  getNewsFromAllProviders: getNewsFromAllProviders,
};
