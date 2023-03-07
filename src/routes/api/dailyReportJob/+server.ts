import nodemailer from 'nodemailer';
import { CronJob } from 'quirrel/sveltekit';
import { logger } from '$lib/utils/logger';
import { BUXFER_EMAIL as SERVER_USER, EMAIL_FROM, SERVER_PASS } from '$env/static/private';

// TODO - evaluate Upstash and Vercel cronjobs alternatives.
// TODO - rename to 'daily expense summary report'.
const cronJob = CronJob(
	'api/dailyReportJob', // the route that it's reachable on
	'0 8 * * *', // every day at 8AM. you can also write @weekly or @daily!
	async () => {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: SERVER_USER,
				pass: SERVER_PASS,
			},
		});
		const mailOptions = {
			from: EMAIL_FROM,
			to: SERVER_USER,
			subject: 'Personal Financal Report',
			text: '',
		};

		transporter.sendMail(mailOptions, (error, info) => {
			// TODO - replace with logging collection data service (ex. Sentry).
			if (error) {
				logger.error(error);
			} else {
				logger.info(`Email sent: ${info.response}`);
			}
		});
	}
);

export const POST = cronJob;
export default cronJob;
