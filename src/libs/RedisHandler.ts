import { createClient } from "redis"

const client = createClient({
	url: process.env.REDIS_URL || "redis://localhost:6379",
})

client.connect()

export async function connect(): Promise<void> {
	await client.hSet(
		`kibo-${new Date().getTime()}`,
		"data",
		JSON.stringify({ name: "car", time: new Date() })
	)
}

