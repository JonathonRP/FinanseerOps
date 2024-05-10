import { resend } from '$/server';
import * as Sentry from '@sentry/sveltekit';
import { parseRefill } from 'svelte-api-keys';
import { EMAIL_FROM, VERCEL_DOMAIN } from '$env/static/private';

// TODO - evaluate Upstash and Vercel cronjobs alternatives.
// TODO - use supabase postgres cron.

export const POST = async ({ url, params, locals }) => {
	await locals.api.has(`email`).limit(parseRefill('30 / MINUTE, 10'));

	const mailOptions = {
		from: EMAIL_FROM,
		to: params.userEmail,
		subject: 'Reminder to check cash flow',
		text: `Go see your cashflow!`,
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		html: html(new URL(`https://${VERCEL_DOMAIN}`) || url),
	};

	await new Promise((resolve, reject) => {
		resend.emails
			.send(mailOptions)
			.then((res) => {
				resolve(`Email sent: ${res}`);
			})
			.catch((error) => {
				Sentry.captureException(error);
				reject(error);
			});
	});

	return Response.json({ success: true });

	function html(site: URL) {
		const escapedHost = site.host.replace(/\./g, '&#8203;.');

		const brandColor = '#ff3e00';
		const buttonText = '#fff';

		const color = {
			background: '#f9f9f9',
			text: '#444',
			mainBackground: '#fff',
		};
		return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Review finances at <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${brandColor}"><a href="${site.origin}"
                target="_blank"
                style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${brandColor}; display: inline-block; font-weight: bold;">View Finances</a></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>`;
	}
};
