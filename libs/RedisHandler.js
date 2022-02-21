import { createClient } from "redis"
const client = createClient({
	url: "redis://localhost:6379",
})

client.connect()

export async function connect() {
	await client.hSet(
		`kibo-${new Date().getTime()}`,
		JSON.stringify({ name: "car", time: new Date() })
	)
	// const value = await client.hGet(`kibo-${new Date().getTime}`)
	// console.log(client)

	// console.log(value)
}
