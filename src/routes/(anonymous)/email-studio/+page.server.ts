import { createEmail, emailList, sendEmail } from 'svelte-email-tailwind/preview';
import { PRIVATE_RESEND_API_KEY } from '$env/static/private';

export async function load() {
	// return the list of email components
	return emailList({
		path: '/src/emailTemplates',
	});
}

export const actions = {
	// Pass in the two actions. Provide your Resend API key.
	...createEmail,
	...sendEmail({ resendApiKey: PRIVATE_RESEND_API_KEY }),
};
