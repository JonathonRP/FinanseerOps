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
	<Head />
	<Preview>{previewText}</Preview>
	<Tailwind>
		<Body class="mx-auto my-auto bg-white font-sans">
			<Container class="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
				<Section class="mt-[32px]">
					<Img src={`${baseUrl}/static/vercel-logo.png`} width="40" height="37" alt="Vercel" class="mx-auto my-0" />
				</Section>
				<Heading class="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
					Join <strong>{teamName}</strong> on <strong>Vercel</strong>
				</Heading>
				<Text class="text-[14px] leading-[24px] text-black">
					Hello {username},
				</Text>
				<Text class="text-[14px] leading-[24px] text-black">
					<strong>bukinoshita</strong> (
					<Link href={`mailto:${invitedByEmail}`} class="text-blue-600 no-underline">
						{invitedByEmail}
					</Link>
					) has invited you to the <strong>{teamName}</strong> team on{' '}
					<strong>Vercel</strong>.
				</Text>
				<Section>
					<Column class="justify-end">
						<Img class="rounded-full" src={userImage} width="64" height="64" />
					</Column>
					<Column class="justify-center">
						<Img src={`${baseUrl}/static/vercel-arrow.png`} width="12" height="9" alt="invited you to" />
					</Column>
					<Column class="justify-start">
						<Img class="rounded-full" src={teamImage} width="64" height="64" />
					</Column>
				</Section>
				<Section class="mb-[32px] mt-[32px] text-center">
					<Button
						pX={20}
						pY={12}
						class="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
						href={inviteLink}>
						Join the team
					</Button>
				</Section>
				<Text class="text-[14px] leading-[24px] text-black">
					or copy and paste this URL into your browser:{' '}
					<Link href={inviteLink} class="text-blue-600 no-underline">
						{inviteLink}
					</Link>
				</Text>
				<Hr class="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
				<Text class="text-[12px] leading-[24px] text-[#666666]">
					This invitation was intended for{' '}
					<span class="text-black">{username} </span>.This invite was sent from{' '}
					<span class="text-black">{inviteFromIp}</span> located in{' '}
					<span class="text-black">{inviteFromLocation}</span>. If you were not expecting this invitation, you can
					ignore this email. If you are concerned about your account's safety, please reply to this email to get in
					touch with us.
				</Text>
			</Container>
		</Body>
	</Tailwind>
</Html>
