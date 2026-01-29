import cron from "node-cron"
import moment from "moment"
import { connect } from "./RedisHandler.js"

export function cronTimer(): void {
	cron.schedule("* * * * *", function () {
		console.log("running a task every minute -", moment().format())
		connect()
	})
}

