<svelte:options runes={true} />

<script lang="ts">
	import { icons } from '$/icons';
	import { SignIn } from '@auth/sveltekit/components';
	import toast from 'svelte-french-toast';

	const { data } = $props<{ data: import('./$types').PageData }>();
	const { redirectTo, redirectReason } = $derived(data);

	$effect(() => {
		if (redirectReason) {
			toast(redirectReason, { icon: icons.InfoIcon, iconTheme: { primary: '#3d85c6', secondary: '#ffffff' } });
		}
	});
</script>

<main class="flex flex-1 flex-col items-center justify-center overflow-hidden">
	<div
		class="grid w-[368px] overflow-hidden rounded-2xl bg-slate-200 pt-1 md:flex dark:bg-neutral-808 dark:text-neutral-309">
		<div class="flex h-full w-full items-center justify-center p-4">
			<SignIn
				provider="resend"
				className="w-full h-full"
				signInPage="auth"
				options={{ redirectTo, redirect: !!redirectTo }}>
				<svelte:fragment slot="email">
					<label class="px-1 font-bold" for="email">Email</label>
					<div
						class="mb-2 mt-1 flex items-center rounded-2xl border-2 border-neutral-309 px-3 py-2 dark:border-neutral-500">
						<svelte:component this={icons.Email} class="h5 w-5 text-gray-400" height="auto" inline />
						<input
							class="border-none bg-transparent pl-2 outline-none focus-visible:ring-0"
							type="email"
							name="email"
							id="email"
							placeholder="Email" />
					</div>
				</svelte:fragment>
				<span
					slot="submitButton"
					class="mb-2 mt-1 flex h-16 w-full items-center justify-center rounded-xl bg-orange-600 py-2 text-lg font-semibold leading-6 text-white">
					Sign in with resend
				</span>
			</SignIn>
		</div>
	</div>
</main>
