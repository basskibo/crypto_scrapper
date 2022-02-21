import {} from "dotenv/config"

const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || "0.0.0.0"

import Fastify from "fastify"
const fastify = Fastify({
	logger: true,
})
import * as router from "./src/router.js"

fastify.register(router)
// fastify.register(cryptoRouter)

// Run the server!
fastify.listen(PORT, () => {
	console.log("Server listening on port: ", PORT)
})
// const start = async () => {
// 	try {
// 		await fastify.listen(PORT)
// 	} catch (err) {
// 		fastify.log.error(err)
// 		process.exit(1)
// 	}
// }
// start()
