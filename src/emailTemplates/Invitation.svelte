<script lang="ts">
	import {
		Body,
		Button,
		Container,
		Column,
		Head,
		Heading,
		Hr,
		Html,
		Img,
		Link,
		Preview,
		Section,
		Tailwind,
		Text,
	} from '@bradford/svelte-mail';

	export let previewText: string,
		baseUrl: string,
		teamName: string,
		username: string,
		invitedByEmail: string,
		userImage: string,
		teamImage: string,
		inviteLink: string,
		inviteFromIp: string,
		inviteFromLocation: string;
</script>

<Html>
	<Head></Head>
	<Preview>{previewText}</Preview>

	<Heading class="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
		Join <strong>{teamName}</strong> on <strong>Vercel</strong>
	</Heading>
	<Text class="text-[14px] leading-[24px] text-black">
		Hello {username},
	</Text>

	<strong>bukinoshita</strong> ( ) has invited you to the <strong>{teamName}</strong> team on{' '}
	<strong>Vercel</strong>.

	<Section class="mb-[32px] mt-[32px] text-center">
		<Button
			pX={20}
			pY={12}
			class="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
			href={inviteLink}>
			Join the team
		</Button>
	</Section>

	or copy and paste this URL into your browser:{' '}

	<Text class="text-[12px] leading-[24px] text-[#666666]">
		This invitation was intended for{' '}
		<span class="text-black">{username} </span>.This invite was sent from{' '}
		<span class="text-black">{inviteFromIp}</span> located in{' '}
		<span class="text-black">{inviteFromLocation}</span>. If you were not expecting this invitation, you can ignore this
		email. If you are concerned about your account's safety, please reply to this email to get in touch with us.
	</Text>
</Html>
