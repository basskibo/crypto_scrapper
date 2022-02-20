const PORT = process.env.PORT || 8000

const fastify = require("fastify")({ logger: true })
const router = require("./src/router")

fastify.register(router)

// Run the server!
fastify.listen(PORT, "0.0.0.0", () => {
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
