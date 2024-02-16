<svelte:options runes={true} />

<script lang="ts">
	import { encrypt } from '$lib/utils/cryption';
	import { ZodError, object, string } from 'zod';
	import { icons } from '$/icons';
	import toast from 'svelte-french-toast';
	import { enhance, applyAction } from '$app/forms';

	const { data } = $props<{ data: import('./$types').PageData }>();
	const { redirectReason } = $derived(data);

	$effect(() => {
		if (redirectReason) {
			toast(redirectReason, { icon: icons.InfoIcon, iconTheme: { primary: '#3d85c6', secondary: '#ffffff' } });
		}
	});
</script>

<div
	class="flex w-full max-md:grid max-md:w-[368px] max-md:self-center max-md:justify-self-center max-md:overflow-hidden max-md:rounded-2xl max-md:bg-slate-200 max-md:px-8 md:h-full max-md:dark:bg-neutral-808">
	<div
		class="i relative hidden w-1/2 items-center justify-around overflow-hidden bg-[url(https://www.buxfer.com/media/UIFrontPage/topbackground-image.jpg)] bg-cover bg-[100%_50%] bg-no-repeat md:flex">
		<div class="px-6 font-['Lato',Arial,sans-serif] text-[20px] leading-[inherit] text-[#d4d5d5]">
			<div
				class="h-[75px] w-[250px] bg-[url(https://www.buxfer.com/media/UIFrontPage/logo-buxfer.png)] bg-contain bg-no-repeat" />
			<h1 class="mb-[10px] text-left text-[32px] capitalize text-[#36c0ff]">Take control of your financial future</h1>
			<p>Budgeting. Forecasting. Investments. Retirement Planning.</p>
			<p>All at one secure place.</p>
			<a
				href="http://www.buxfer.com"
				class="mb-2 mt-4 block w-28 rounded-xl bg-white py-2 text-center text-lg font-semibold text-orange-400"
				>Read More</a>
		</div>
	</div>
	<div class="flex items-center justify-center py-10 md:w-1/2">
		<form
			class="w-full max-w-sm md:w-1/2"
			method="post"
			use:enhance={async ({ formData }) => {
				if (formData.has('password')) {
					const expectAccount = object({
						email: string().email().min(1),
						password: string()
							.min(1)
							.transform((val) => encrypt(val)),
					});
					let data = Object.fromEntries(formData);
					let errors = null;

					try {
						const validData = expectAccount.parse(data);
						data = validData;

						formData.set('password', data.password);
					} catch (err) {
						if (err instanceof ZodError) {
							const { fieldErrors } = err.flatten();
							errors = fieldErrors;

							toast.error(`invalid login attempt: ${JSON.stringify(errors)}`);
						}

						toast.error(err.message);
					}
				} else {
					toast.error('invalid login, supply password');
				}

				return async ({ result, update }) => {
					// `result` is an `ActionResult` object
					// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
					switch (result.type) {
						case 'success':
							await update();
							toast.success(`Buxfer Account connected!`);
							break;
						case 'failure': {
							const [firstError] = Object.keys(result.data?.errors);
							toast.error(result.data?.errors[firstError][0]);
							break;
						}
						case 'error':
							toast.error(result.error.message);
							break;
						default:
							await update();
					}
					await applyAction(result);
				};
			}}>
			<div class="mb-4 flex items-center rounded-2xl border-2 border-neutral-309 px-3 py-2 dark:border-neutral-500">
				<!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
				viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
			</svg> -->
				<svelte:component this={icons.Email} class="h5 w-5 text-gray-400" height="auto" inline />
				<input
					class="appearance-none border-none bg-transparent pl-2 outline-none focus-visible:ring-0"
					type="text"
					name="email"
					id="email"
					placeholder="Email" />
			</div>
			<div class="flex items-center rounded-2xl border-2 border-neutral-309 px-3 py-2 dark:border-neutral-500">
				<!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
				fill="currentColor">
				<path fill-rule="evenodd"
					d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
					clip-rule="evenodd" />
			</svg> -->
				<svelte:component this={icons.Password} class="h5 w-5 text-gray-400" height="auto" inline />
				<input
					class="appearance-none border-none bg-transparent pl-2 outline-none forced-color-adjust-none focus-visible:ring-0"
					type="password"
					name="password"
					id="password"
					placeholder="Password" />
			</div>
			<button
				type="submit"
				class="mb-2 mt-4 block h-16 w-full rounded-xl bg-orange-600 py-2 text-lg font-semibold leading-6 text-white"
				>Connect</button>
		</form>
	</div>
</div>
