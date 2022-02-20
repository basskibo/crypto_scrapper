const helper_methods = require("./helper_method")
const axios = require("axios")
const cheerio = require("cheerio")
// const app = express()
const config = require("../config/config")
// const cryptoData = require("./data/crypto.json")
const newspapers = config.newspapers
const cryptoPriceProvider = config.cryptoPriceProvider
const availableProviders = newspapers.map((provider) => provider.name)
const cryptoData = require("../data/crypto.json")

const articles = []
let NEWS_ALL = [],
	CRYPTO_PRICES = []

setInterval(async () => {
	console.log("**************************************")
	console.log("Fetching data .....")
	console.log("**************************************")
	NEWS_ALL = await helper_methods.getNewsFromAllProviders(newspapers)
}, 60 * 1000 * 1000)

async function routes(fastify, options) {
	fastify.get("/", (req, res) => {
		return "Welcome to the Crypto API !"
	})

	/**
	 * description Crypto news / NFT
	 */
	fastify.get("/news", async (req, res) => {
		if (NEWS_ALL.length > 0) {
			console.log("Using cached data")
			return NEWS_ALL
		} else {
			NEWS_ALL = await helper_methods.getNewsFromAllProviders(newspapers, "Bitcoin")
			console.log(
				`Fetch completed, successfully scrfastifyed data from ${NEWS_ALL.length} articles`
			)
			return NEWS_ALL
		}
	})

	/**
	 * description Crypto news / NFT
	 */
	fastify.get("/news/provider/:newspaperId", async (req, res) => {
		const newsPaperId = req.params.newspaperId
		const keyword = req.headers.keyword
		console.log(`Looking for keyword ${keyword} on provider ${newsPaperId}`)
		const newspaperProvider = newspapers.filter(
			(newspaper) => newspaper.name == newsPaperId
		)[0]
		if (!newspaperProvider) {
			return res
				.status(404)
				.send(
					`Provider with name ${req.params.newspaperId} was not found. Available providers are : ${availableProviders}`
				)
		}
		const results = await axios.get(newspaperProvider.address)
		const payloadJSON = helper_methods.generateArticlePayload(
			results,
			newspaperProvider,
			keyword
		)
		console.log(payloadJSON)
		return payloadJSON
	})

	/**
	 * description CRYPTO PRICES
	 */
	// fastify.get("/crypto/price", async (req, res) => {
	// 	if (CRYPTO_PRICES.length > 0) {
	// 		console.log("Using cached data")
	// 		res.json(NEWS_ALL)
	// 	} else {
	// 		const keys = config.cryptoKeys
	// 		console.log(`There is no data, fetching from ${cryptoPriceProvider.address}`)
	// 		const { data } = await axios.get(cryptoPriceProvider.address)

	// 		const cryptos = []
	// 		const $ = cheerio.load(data)
	// 		const elemSelector = "table > tbody > tr"

	// 		$(elemSelector).each((parentIdx, parentElem) => {
	// 			let keyIdx = 0
	// 			const coin = {}
	// 			if (parentIdx < 20) {
	// 				$(parentElem)
	// 					.children()
	// 					.each((children, childElem) => {
	// 						let tdValue = $(childElem).text()
	// 						if (keyIdx === 1 || keyIdx === 6) {
	// 						}
	// 						if (tdValue) {
	// 							coin[keys[keyIdx]] = tdValue
	// 							keyIdx++
	// 						}
	// 					})
	// 				coin.name = helper_methods.sliceCryptoName(coin)
	// 				coin.circuilatingSupply =
	// 					helper_methods.sliceCryptocircuilatingSupply(coin)
	// 				coin.marketCap = helper_methods.sliceMarketCap(coin)
	// 				cryptos.push(coin)
	// 				console.log(coin)
	// 			}
	// 		})
	// 		return cryptos
	// 	}
	// })
	// fastify.get("/crypto/:cryptoName", async (req, res) => {
	// 	const keys = config.cryptoKeys
	// 	const cryptoName = req.params.cryptoName
	// 	console.log(`There is no data, fetching from ${cryptoPriceProvider.address}`)
	// 	const { data } = await axios.get(cryptoPriceProvider.address)

	// 	const cryptos = []
	// 	const $ = cheerio.load(data)
	// 	const elemSelector = "table > tbody > tr"

	// 	$(elemSelector).each((parentIdx, parentElem) => {
	// 		let keyIdx = 0
	// 		const coin = {}
	// 		if (parentIdx < 20) {
	// 			$(parentElem)
	// 				.children()
	// 				.each((children, childElem) => {
	// 					let tdValue = $(childElem).text()
	// 					if (tdValue) {
	// 						coin[keys[keyIdx]] = tdValue
	// 						keyIdx++
	// 					}
	// 				})
	// 			coin.name = helper_methods.sliceCryptoName(coin)
	// 			if (cryptoName === coin.name || cryptoName === coin.shortName) {
	// 				cryptos.push(coin)
	// 				console.log(coin)
	// 			}
	// 		}
	// 	})
	// 	return cryptos
	// })

	fastify.get("/crypto/list", async (req, res) => {
		const keys = config.cryptoKeys
		console.log(`There is no data, fetching from ${cryptoPriceProvider.address}`)
		const { data } = await axios.get(cryptoPriceProvider.address)

		const cryptos = []
		const $ = cheerio.load(data)
		const elemSelector = "table > tbody > tr"

		$(elemSelector).each((parentIdx, parentElem) => {
			let keyIdx = 0
			const coin = {}
			if (parentIdx < 20) {
				$(parentElem)
					.children()
					.each((children, childElem) => {
						let tdValue = $(childElem).text()
						if (keyIdx === 1 || keyIdx === 2) {
							coin[keys[keyIdx]] = tdValue
						}
						keyIdx++
					})
				coin.name = helper_methods.sliceCryptoName(coin)

				cryptos.push(coin)
				console.log(coin)
			}
		})
		return cryptos
	})

	fastify.get("/crypto/top50", (req, res) => {
		return cryptoData.top50Currencies
	})
}

module.exports = routes
