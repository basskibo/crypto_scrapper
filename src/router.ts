import {
	generateArticlePayload,
	getNewsFromAllProviders,
	Article,
} from "./helper_method.js"
import axios from "axios"
import { newspapers } from "./config/config.js"
// import { test } from "../services/scr_crypto.js"
import { cronTimer } from "./libs/cron.js"
import cryptoData from "./data/crypto.json"
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"

// const articles: Article[] = []
let NEWS_ALL: Article[] = []
// let CRYPTO_PRICES: any[] = []

cronTimer()
setInterval(async () => {
	console.log("**************************************")
	console.log("Fetching data .....")
	console.log("**************************************")
	NEWS_ALL = await getNewsFromAllProviders(newspapers)
}, 60 * 1000 * 1000)

export default async function routes(
	fastify: FastifyInstance,
	_options: any
): Promise<void> {
	fastify.get("/", async (_req: FastifyRequest, _res: FastifyReply) => {
		return "Welcome to the Crypto API !"
	})

	/**
	 * description Crypto news / NFT
	 */
	fastify.get("/news", async (_req: FastifyRequest, _res: FastifyReply) => {
		if (NEWS_ALL.length > 0) {
			console.log("Using cached data")
			return NEWS_ALL
		} else {
			NEWS_ALL = await getNewsFromAllProviders(newspapers, "Bitcoin")
			console.log(
				`Fetch completed, successfully scrfastifyed data from ${NEWS_ALL.length} articles`
			)
			return NEWS_ALL
		}
	})

	/**
	 * description Crypto news / NFT
	 */
	fastify.get(
		"/news/provider/:newspaperId",
		async (
			req: FastifyRequest<{ Params: { newspaperId: string } }>,
			res: FastifyReply
		) => {
			const newsPaperId = req.params.newspaperId
			const keyword = (req.headers.keyword as string) || undefined
			console.log(`Looking for keyword ${keyword} on provider ${newsPaperId}`)
			const newspaperProvider = newspapers.filter(
				(newspaper) => newspaper.name == newsPaperId
			)[0]
			if (!newspaperProvider) {
				return res
					.status(404)
					.send(
						`Provider with name ${req.params.newspaperId} was not found. Available providers are : ${newspapers.map((p) => p.name).join(", ")}`
					)
			}
			const results = await axios.get<string>(newspaperProvider.address)
			const payloadJSON = generateArticlePayload(results, newspaperProvider, keyword)
			console.log(payloadJSON)
			return payloadJSON
		}
	)

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
	// 				coin.name = sliceCryptoName(coin)
	// 				coin.circuilatingSupply =
	// 					sliceCryptocircuilatingSupply(coin)
	// 				coin.marketCap = sliceMarketCap(coin)
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
	// 			coin.name = sliceCryptoName(coin)
	// 			if (cryptoName === coin.name || cryptoName === coin.shortName) {
	// 				cryptos.push(coin)
	// 				console.log(coin)
	// 			}
	// 		}
	// 	})
	// 	return cryptos
	// })

	// fastify.get("/crypto/list", async (req, res) => {
	// 	const keys = config.cryptoKeys
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
	// 					if (keyIdx === 1 || keyIdx === 2) {
	// 						coin[keys[keyIdx]] = tdValue
	// 					}
	// 					keyIdx++
	// 				})
	// 			coin.name = sliceCryptoName(coin)

	// 			cryptos.push(coin)
	// 			console.log(coin)
	// 		}
	// 	})
	// 	return cryptos
	// })

	fastify.get("/crypto/top50", async (_req: FastifyRequest, _res: FastifyReply) => {
		return cryptoData.top50Currencies
	})
}

