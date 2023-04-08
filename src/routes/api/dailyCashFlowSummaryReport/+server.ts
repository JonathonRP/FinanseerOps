import nodemailer from 'nodemailer';
import { logger } from '$lib/server/logger';
import { BUXFER_EMAIL as SERVER_USER, EMAIL_FROM, SERVER_PASS } from '$env/static/private';

// TODO - evaluate Upstash and Vercel cronjobs alternatives.
export async function POST() {
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
