import { createClient } from "redis"

console.log(process.env)
const client = createClient({
	url: "redis://alice:foobared@awesome.redis.server:6380",
})

console.log(client)
