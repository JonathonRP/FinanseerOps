import { BUXFER_EMAIL as SERVER_USER, EMAIL_FROM, SERVER_PASS } from '$env/static/private';
import nodemailer from 'nodemailer';
import { CronJob } from 'quirrel/sveltekit';

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
			if (error) {
				console.log(error);
			} else {
				console.log(`Email sent: ${info.response}`);
			}
		});
	}
);

export const POST = cronJob;
export default cronJob;
