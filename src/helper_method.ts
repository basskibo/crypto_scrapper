import * as cheerio from "cheerio"
import axios, { AxiosResponse } from "axios"
import { Newspaper } from "./config/config.js"

export interface Article {
	title: string
	url: string
	source: string
	provider: string
}

export interface Coin {
	name?: string
	shortName?: string
	marketCap?: string
	circuilatingSupply?: string
	[key: string]: string | undefined
}

const removeDuplicates = <T extends Record<string, any>>(
	originalArray: T[],
	prop: keyof T
): T[] => {
	const newArray: T[] = []
	const lookupObject: Record<string, T> = {}

	for (const item of originalArray) {
		const key = String(item[prop])
		lookupObject[key] = item
	}

	for (const key in lookupObject) {
		newArray.push(lookupObject[key])
	}
	return newArray
}

const generateArticlePayload = (
	response: AxiosResponse<string>,
	newspaperAddr: Newspaper,
	keyword?: string
): Article[] => {
	const html = response.data
	const $ = cheerio.load(html)
	let articles: Article[] = []
	const key = keyword ? keyword : "crypto"
	console.log(key)
	$(`a:contains(${JSON.stringify(key)})`, html).each(function (this: any) {
		// title parsing and removing whitespaces
		let title = $(this).text()
		title = title.replace(/^\s+|\s+$/gm, "")
		title = title.replace(/(\r\n|\n|\r)/gm, "")
		title = title.replace(/\u00AD/g, "") // replacing &shy
		// URL generation and formatting
		let url = $(this).attr("href")
		if (!url) return
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

const getNewsFromAllProviders = async (
	newspapers: Newspaper[],
	keyword?: string
): Promise<Article[]> => {
	let articles: Article[] = []
	console.log("fetching news for ", keyword)
	for (let i = 0; i < newspapers.length; i++) {
		const source = newspapers[i]
		const key = keyword ? keyword : "crypto"
		await axios.get<string>(source.address).then((response) => {
			const html = response.data
			const $ = cheerio.load(html)
			const searchQuery = source.textSource
				? `a:contains("${source.textLocation}")`
				: `a:contains(${JSON.stringify(key)})`

			console.log(searchQuery)
			$(searchQuery, html).each(function (this: any) {
				// title parsing and removing whitespaces
				let title = source.textLocation
					? $(this).attr(source.textLocation) || ""
					: $(this).text()
				title = title.replace(/^\s+|\s+$/gm, "")
				title = title.replace(/(\r\n|\n|\r)/gm, "")
				// URL generation and formatting
				const url = $(this).attr("href")
				if (!url) return
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
const getCryptoPrices = async (
	_provider: Newspaper,
	response: AxiosResponse<string>
): Promise<void> => {
	const html = response.data
	const $ = cheerio.load(html)
	const elemSelector =
		"#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"
	$(elemSelector).each((parentIdx, _parentElem) => {
		console.log(parentIdx)
	})
}

const sliceCryptoName = (coin: Coin): string | undefined => {
	try {
		console.log(coin)
		if (!coin.name || !coin.shortName) return undefined
		const fullname = coin.name
		const shortLength = coin.shortName.length
		console.log(fullname.substring(shortLength))
		return fullname.substring(shortLength)
	} catch (exc) {
		console.log("there was error slicing crypto name...")
		return undefined
	}
}

const sliceCryptocircuilatingSupply = (coin: Coin): string | undefined => {
	try {
		if (!coin.circuilatingSupply || !coin.shortName) return undefined
		const circ = coin.circuilatingSupply
		const newStr = circ.split(" ")
		const circulatingParsed = `${newStr[0]} ${coin.shortName}`
		return circulatingParsed
	} catch (exc) {
		console.log("there was error sliceCryptocircuilatingSupply...")
		return undefined
	}
}

const sliceMarketCap = (coin: Coin): string | undefined => {
	try {
		if (!coin.marketCap) return undefined
		const circ = coin.marketCap
		const newStr = circ.split("$")
		console.log(newStr)
		return newStr[2]
	} catch (exc) {
		console.log("there was error sliceMarketCap...")
		return undefined
	}
}

export {
	removeDuplicates,
	generateArticlePayload,
	getNewsFromAllProviders,
	getCryptoPrices,
	sliceCryptoName,
	sliceCryptocircuilatingSupply,
	sliceMarketCap,
}

