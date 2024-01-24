<svelte:options runes={true} />
<script lang="ts">
	import { encrypt } from '$lib/utils/cryption';
	import { enhance } from '$app/forms';
	import { ZodError, object, string } from 'zod';
	import { icons } from '$/icons';
	import toast from 'svelte-french-toast';
</script>

<div class="flex w-full md:h-full max-md:grid max-md:px-8 max-md:w-[368px] max-md:self-center max-md:justify-self-center max-md:rounded-2xl max-md:bg-slate-200 max-md:overflow-hidden max-md:dark:bg-neutral-808">
<div
	class="relative overflow-hidden md:flex w-1/2 bg-[url(https://www.buxfer.com/media/UIFrontPage/topbackground-image.jpg)] bg-[100%_50%] bg-cover bg-no-repeat i justify-around items-center hidden">
	<div class="px-6 font-['Lato',Arial,sans-serif] text-[20px] text-[#d4d5d5] leading-[inherit]">
		<div class="bg-[url(https://www.buxfer.com/media/UIFrontPage/logo-buxfer.png)] bg-contain w-[250px] h-[75px] bg-no-repeat" />
		<h1 class="text-[#36c0ff] text-[32px] mb-[10px] capitalize text-left">Take control of your financial future</h1>
		<p>Budgeting. Forecasting. Investments. Retirement Planning.</p>
		<p>All at one secure place.</p>
		<a href="http://www.buxfer.com" class="block w-28 text-center bg-white text-orange-400 mt-4 py-2 rounded-xl font-semibold mb-2 text-lg">Read More</a>
	</div>
</div>
<div class="flex md:w-1/2 justify-center py-10 items-center">
	<form class="w-full md:w-1/2 max-w-sm" method="post" use:enhance onsubmit={async (event) => {
		const formData = new FormData(event.currentTarget);
		if (formData.has('password')) {
			const expectAccount = object({ email: string().email().min(1), password: string().min(1).transform(val => encrypt(val))});
			let data = Object.fromEntries(formData);
			let errors = null;

			try {
				const validData = expectAccount.parse(data);
				data = validData;
			} catch (err) {

				if (err instanceof ZodError) {
					const { fieldErrors } = err.flatten();
					errors = fieldErrors;
				}

				toast.error(`invalid login attempt: ${JSON.stringify(errors)}`);
			}

			formData.set('password', data.password);
		} else {
			toast.error('invalid login, supply password');
		}
	}}>
		<div class="flex items-center border-2 py-2 px-3 rounded-2xl mb-4 border-neutral-309 dark:border-neutral-500">
			<!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
				viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
			</svg> -->
			<svelte:component this={icons.Email} class='h5 w-5 text-gray-400' height='auto' inline />
			<input class="pl-2 outline-none border-none bg-transparent focus-visible:ring-0 appearance-none" type="text" name="email" id="email" placeholder="Email" />
		</div>
		<div class="flex items-center border-2 py-2 px-3 rounded-2xl border-neutral-309 dark:border-neutral-500">
			<!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
				fill="currentColor">
				<path fill-rule="evenodd"
					d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
					clip-rule="evenodd" />
			</svg> -->
			<svelte:component this={icons.Password} class='h5 w-5 text-gray-400' height='auto' inline />
			<input class="pl-2 outline-none border-none bg-transparent focus-visible:ring-0 forced-color-adjust-none appearance-none" type="password" name="password" id="password" placeholder="Password" />
		</div>
		<button type="submit" class="block h-16 w-full bg-orange-600 text-white mt-4 py-2 rounded-xl mb-2 text-lg leading-6 font-semibold">Connect</button>
	</form>
</div>
</div>