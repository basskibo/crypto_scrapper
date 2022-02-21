import cron from "node-cron"
import moment from "moment"

export function cronTimer() {
	cron.schedule("* * * * *", function () {
		console.log("running a task every minute -", moment().format())
	})
}
