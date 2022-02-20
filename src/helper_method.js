const cheerio = require("cheerio")
const axios = require("axios")

const removeDuplicates = (originalArray, prop) => {
	var newArray = []
	var lookupObject = {}

	for (var i in originalArray) {
		lookupObject[originalArray[i][prop]] = originalArray[i]
	}

	for (i in lookupObject) {
		newArray.push(lookupObject[i])
	}
	return newArray
}

const generateArticlePayload = (response, newspaperAddr) => {
	const html = response.data
	const $ = cheerio.load(html)
	let articles = []
	$('a:contains("NFT")', html).each(function () {
		// title parsing and removing whitespaces
		let title = $(this).text()
		title = title.replace(/^\s+|\s+$/gm, "")
		title = title.replace(/(\r\n|\n|\r)/gm, "")
		// URL generation and formatting
		let url = $(this).attr("href")
		let parsedUrl = `${newspaperAddr.address}${url}`
		let formattedUrl = newspaperAddr.urlRootFormation
			? `${newspaperAddr.urlRootFormation}${url}`
			: parsedUrl

		if (newspaperAddr.baseUrl) {
			formattedUrl = url
		}

		title = title.replace(/^\s+|\s+$/gm, "")
		title = title.replace(/(\r\n|\n|\r)/gm, "")
		// URL generation and formatting
		console.log(title)
		articles.push({
			title,
			url: formattedUrl,
			source: newspaperAddr.name,
			provider: newspaperAddr.provider,
		})
	})
	articles = removeDuplicates(articles, "url")

	return articles
}

const getNewsFromAllProviders = async (newspapers, keyword) => {
	let articles = []
	console.log("fetching news for ", keyword)
	for (let i = 0; i < newspapers.length; i++) {
		const source = newspapers[i]
		await axios.get(source.address).then((response) => {
			const html = response.data
			const $ = cheerio.load(html)
			const searchQuery = source.textSource
				? `a:contains("${source.textLocation}")`
				: `a:contains(${JSON.stringify(keyword)})`

			console.log(searchQuery)
			$(searchQuery, html).each(function () {
				// title parsing and removing whitespaces
				let title = source.textLocation
					? $(this).attr(source.textLocation)
					: $(this).text()
				title = title.replace(/^\s+|\s+$/gm, "")
				title = title.replace(/(\r\n|\n|\r)/gm, "")
				// URL generation and formatting
				const url = $(this).attr("href")
				const parsedSource = `${source.address}${url}`
				const formattedUrl = source.urlRootFormation
					? `${source.urlRootFormation}${url}`
					: parsedSource

				articles.push({
					title,
					url: formattedUrl,
					source: source.name,
					provider: source.provider,
				})
				console.log("PUSHING >>>>> ", title)
				articles = removeDuplicates(articles, "url")
			})
		})
	}
	return articles
}

/**
 * description Get crypto information and prices
 * @params {Object} provider - provider of crypto prices
 * @params {Object} response - response from cheerio
 */
const getCryptoPrices = async (provider, response) => {
	const html = response.data
	const $ = cheerio.load(html)
	let articles = []
	const elemSelector =
		"#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"
	$(elemSelector).each((parentIdx, parentElem) => {
		console.log(parentIdx)
	})
}

const sliceCryptoName = (coin) => {
	try {
		console.log(coin)
		const fullname = coin.name
		const shortLength = coin.shortName.length
		console.log(fullname.substring(shortLength))
		return fullname.substring(shortLength)
	} catch (exc) {
		console.log("there was error slicing crypto name...")
	}
}

const sliceCryptocircuilatingSupply = (coin) => {
	try {
		const circ = coin.circuilatingSupply
		const newStr = circ.split(" ")
		const circulatingParsed = `${newStr[0]} ${coin.shortName}`
		return circulatingParsed
	} catch (exc) {
		console.log("there was error sliceCryptocircuilatingSupply...")
	}
}

const sliceMarketCap = (coin) => {
	try {
		const circ = coin.marketCap
		const newStr = circ.split("$")
		console.log(newStr)
		return newStr[2]
	} catch (exc) {
		console.log("there was error sliceMarketCap...")
	}
}

module.exports = {
	generateArticlePayload: generateArticlePayload,
	getNewsFromAllProviders: getNewsFromAllProviders,
	getCryptoPrices: getCryptoPrices,
	sliceCryptoName: sliceCryptoName,
	sliceCryptocircuilatingSupply: sliceCryptocircuilatingSupply,
	sliceMarketCap: sliceMarketCap,
}
