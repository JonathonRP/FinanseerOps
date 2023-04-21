<script lang="ts">
	import classes from 'svelte-transition-classes';
	import { slide } from 'svelte/transition';
	import { derived } from 'svelte/store';

	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { merge } from '$lib/utils';
	import { session } from '$lib/stores/session';
	import useBauhaus from '$lib/stores/useBauhaus';
	import { signOut } from '@auth/sveltekit/client';

	import { api } from '$lib/api';
	import toast from 'svelte-french-toast';

	import logo from '$lib/images/svelte-logo.svg';
	// import dashboard from '@iconify-icons/tabler/chart-infographic';
	import dashboard from '@iconify-icons/tabler/chart-histogram';
	import transactions from '@iconify-icons/tabler/history';
	import newUser from '@iconify-icons/tabler/user-plus';

	import Form from '$lib/components/Form.svelte';
	import Button from '$lib/components/button.svelte';
	import NavLink from './NavLink.svelte';

	const state = {
		closed: false,
		open: true,
	};

	export let name = 'Finanzen';
	export let links: { route: string }[] = [];

	$: routes = merge(
		[{ icon: dashboard, label: 'dashboard' }, { icon: transactions, label: 'transactions' }, { label: 'analytics' }],
		Object.assign(
			[],
			[
				{ route: `${base}/` },
				{ route: `${base}/transactions` },
				{ route: false ? `${base}/analytics` : '/maintenance' },
			],
			links
		)
	);

	let menuOpen: boolean = state.closed;
	let accountOpen: boolean = state.closed;

	const session$ = derived(
		[session, derived(api.user.retrieve.query(), ($user) => $user.data)],
		([$session, $user]) => ({
			...$session,
			user: $user,
		})
	);
	$: ({ user } = $session$);

	const toggleMenu = (definedState?: boolean | undefined) => (event: MouseEvent | KeyboardEvent) => {
		const prevs = document.querySelectorAll('[aria-current="location"]');
		prevs?.forEach((prev) => {
			prev.ariaCurrent = null;
		});

		switch (event.type) {
			case 'keydown':
				if ((event as KeyboardEvent).key === 'Escape') {
					menuOpen = definedState ?? !menuOpen;
				}
				break;
			case 'click':
				menuOpen = definedState ?? !menuOpen;
				break;
			default:
				break;
		}
		if (menuOpen) {
			(event.currentTarget as HTMLButtonElement).ariaCurrent = 'location';
		}
	};

	const randomColor = () =>
		Math.floor(Math.random() * 0xffffff * 1000000)
			.toString(16)
			.slice(0, 6);

	$: userImage =
		user?.image ||
		`https://source.boringavatars.com/${($useBauhaus && 'bauhaus') || 'beam'}/120/${encodeURIComponent(
			user?.name ?? ''
		)}?colors=000000,ff3e00,CDCDCD,4075a6,${randomColor()}`;
</script>

<svelte:window on:keydown={toggleMenu(state.closed)} />
<!-- side-bar -->
<aside class="flex flex-shrink-0 transition-all">
	<div
		on:click={toggleMenu(state.closed)}
		on:keydown={toggleMenu(state.closed)}
		class="fixed inset-0 z-10 bg-black bg-opacity-50 dark:bg-white dark:opacity-25 lg:hidden"
		class:hidden={!menuOpen} />
	<div class="fixed inset-0 z-10 hidden w-16 bg-white dark:bg-gray-800 sm:flex" class:sm:hidden={!menuOpen} />
	<!-- Mobile bottom bar -->
	<nav
		aria-label="Options"
		class="shadow-t fixed inset-x-0 bottom-0 flex flex-row items-center justify-between rounded-t-3xl border-t border-primary-100 bg-white px-4 py-2 dark:border-primary-400/20 dark:bg-gray-800 dark:shadow-neutral-309/20 sm:hidden">
		<!-- Menu button -->
		<button
			on:click={toggleMenu()}
			class="rounded-lg bg-white p-2 text-gray-500 shadow-md transition-colors hover:bg-primary-600 hover:text-white focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 aria-[current=location]:bg-primary-600 aria-[current=location]:text-white dark:bg-gray-800 dark:text-white dark:shadow-neutral-309/20 dark:focus:ring-offset-neutral-808">
			<span class="sr-only">Toggle sidebar</span>
			<svg
				aria-hidden="true"
				class="h-6 w-6"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
			</svg>
		</button>
	</nav>

	<!-- Left mini bar -->
	<nav
		aria-label="Options"
		class="fixed inset-0 z-20 hidden w-16 flex-shrink-0 flex-col items-center rounded-br-3xl rounded-tr-3xl border-r-2 border-primary-100 bg-white py-4 shadow-md dark:border-primary-400/20 dark:bg-gray-800 dark:shadow-neutral-309/20 md:flex lg:static"
		class:rounded-none={false}
		class:border-r-0={false}
		class:shadow-none={false}>
		<!-- Logo -->
		<div class="hidden flex-shrink-0 py-4" />
		<div class="flex flex-1 flex-col items-center space-y-4 p-2">
			<!-- Menu button -->
			<button
				on:click={toggleMenu()}
				class="rounded-lg bg-white p-2 text-gray-500 shadow-md transition-colors hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 aria-[current=location]:bg-primary-600 aria-[current=location]:text-white dark:bg-gray-800 dark:shadow-neutral-309/20 dark:focus:ring-offset-neutral-808">
				<span class="sr-only">Toggle sidebar</span>
				<svg
					aria-hidden="true"
					class="h-6 w-6"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
				</svg>
			</button>
		</div>
	</nav>

	{#if menuOpen}
		<div
			in:classes={{
				duration: 300,
				base: 'transform transition-transform duration-300',
				from: 'translate-x-full sm:-translate-x-full',
				to: 'translate-x-0',
			}}
			out:classes={{
				duration: 300,
				base: 'transform transition-transform duration-300',
				from: 'translate-x-0',
				to: 'translate-x-full sm:-translate-x-full',
			}}
			class="fixed inset-y-0 right-0 z-10 w-64 flex-shrink-0 border-primary-100 bg-white shadow-lg dark:border-primary-400/20 dark:bg-gray-800 dark:shadow-neutral-309/20 max-[640px]:rounded-bl-3xl max-[640px]:rounded-tl-3xl max-[640px]:border-l-2 sm:left-16 sm:w-72 sm:rounded-br-3xl sm:rounded-tr-3xl sm:border-r-2 lg:static lg:w-64">
			<nav aria-label="Main" class="flex h-full flex-col">
				<div class="flex flex-shrink-0 items-center justify-center py-10">
					<h1 class="text-center text-xl font-bold">{name}</h1>
				</div>
				<!-- Account -->
				<div class="flex flex-shrink-0 items-center justify-center">
					<button
						type="button"
						class="h-20 w-20 rounded-full"
						on:click={() => {
							accountOpen = !accountOpen;
						}}>
						<img src={userImage} alt="user profile" />
					</button>
				</div>

				<!-- UserSetting -->
				{#if accountOpen}
					<div transition:slide={{ duration: 300 }} class="flex-shrink-0 px-4 py-2">
						<Form
							method="post"
							action="/user?/update"
							let:submitting
							let:handleBlur
							let:handleInput
							validate={(values) => {
								const errors = { username: '', useBauhaus: '' };

								if (user && values.username === user?.name && Boolean(values.useBauhaus) === $useBauhaus) {
									errors.username = 'No changes to submit.';
								}

								return errors;
							}}
							on:submit={(e) => {
								const form = Object.fromEntries(e.detail.data);

								if (form.useBauhaus !== $useBauhaus) {
									useBauhaus.set(Boolean(form.useBauhaus));
									toast.success(`Now using ${$useBauhaus ? 'Bauhaus' : 'Beam'} avatar.`);
								}

								if (user && user.name === form.username) {
									return false;
								}
								return true;
							}}
							on:success={(e) => {
								toast.success(`Updated ${e.detail.data.get('username')}.`);
							}}
							class="w-full space-y-4">
							<input
								id="name"
								name="username"
								class="flex w-full appearance-none justify-center rounded-full border-none bg-transparent p-1 text-center transition-all hover:ring-1 hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
								type="text"
								value={user?.name}
								on:blur={handleBlur}
								on:input={handleInput}
								disabled={submitting} />
							<label class="mb-2 flex items-center font-bold" for="bauhaus">
								<input
									id="bauhaus"
									name="useBauhaus"
									class="form-checkbox mr-2 rounded-full leading-tight text-primary-500 focus:ring-primary-500 focus:ring-offset-neutral-808"
									type="checkbox"
									checked={$useBauhaus}
									on:blur={handleBlur}
									on:input={handleInput}
									disabled={submitting} />
								<span class="text-sm">Use Buasuah</span>
							</label>
							<Button type="submit">Save Settings</Button>
						</Form>
					</div>
				{/if}

				<!-- Links -->
				<ul class="flex-1 space-y-2 overflow-hidden px-4 py-10 hover:overflow-auto">
					{#each routes as { icon, route, label }, id (id)}
						<li>
							<NavLink active={$page.url.pathname === new URL(route, $page.url.origin).pathname} {icon} {route}>
								{label}
							</NavLink>
						</li>
					{/each}
				</ul>

				{#if user?.role === 'admin'}
					<div class="flex-shrink-0 px-4 py-2">
						<Form
							method="post"
							action="/user?/invite"
							reset={true}
							let:submitting
							let:handleBlur
							let:handleInput
							on:success={(e) => {
								toast.success(`Sent invitation to ${e?.detail?.data.get('email')}.`);
							}}
							class="flex w-full items-center border-b py-2 transition-colors focus-within:border-primary-500 hover:border-primary-400">
							<iconify-icon icon={newUser} inline class="mr-2 flex h-6 w-12 items-center" height="auto" />
							<input
								id="email"
								name="email"
								class="mr-3 w-full appearance-none border-none bg-transparent px-2 py-1 leading-tight text-gray-600 focus:outline-none focus:ring-0 dark:text-neutral-309"
								type="email"
								inputmode="email"
								on:blur={handleBlur}
								on:input={handleInput}
								placeholder="email address"
								required
								aria-label="email"
								disabled={submitting} />
							<Button type="submit" inline>Invite</Button>
						</Form>
					</div>
				{/if}
				{#if user}
					<div class="flex-shrink-0 p-4">
						<Button
							type="button"
							on:click={() => {
								signOut();
							}}>
							Sign Out
						</Button>
					</div>
				{/if}
			</nav>
		</div>
	{/if}
</aside>

<main class="flex flex-1 flex-col px-6 pt-8 md:pl-16 md:pr-32 md:pt-16 lg:px-12">
	<slot />
</main>

<footer class="fixed bottom-20 right-5 flex items-center space-x-4 sm:bottom-5">
	<a href="https://kit.svelte.dev" class="transform transition-transform hover:scale-125">
		<span class="sr-only">SvelteKit</span>
		<img class="h-8 w-8 object-contain" aria-hidden="true" src={logo} alt="SvelteKit" />
	</a>
	<a
		href="https://github.com/JonathonRP/PersonalFinanceDashboard"
		rel="noreferrer"
		target="_blank"
		class="transform transition-transform hover:scale-125">
		<span class="sr-only">Github</span>
		<svg
			aria-hidden="true"
			class="h-8 w-8 text-black"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24">
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M12.026,2c-5.509,0-9.974,4.465-9.974,9.974c0,4.406,2.857,8.145,6.821,9.465 c0.499,0.09,0.679-0.217,0.679-0.481c0-0.237-0.008-0.865-0.011-1.696c-2.775,0.602-3.361-1.338-3.361-1.338 c-0.452-1.152-1.107-1.459-1.107-1.459c-0.905-0.619,0.069-0.605,0.069-0.605c1.002,0.07,1.527,1.028,1.527,1.028 c0.89,1.524,2.336,1.084,2.902,0.829c0.091-0.645,0.351-1.085,0.635-1.334c-2.214-0.251-4.542-1.107-4.542-4.93 c0-1.087,0.389-1.979,1.024-2.675c-0.101-0.253-0.446-1.268,0.099-2.64c0,0,0.837-0.269,2.742,1.021 c0.798-0.221,1.649-0.332,2.496-0.336c0.849,0.004,1.701,0.115,2.496,0.336c1.906-1.291,2.742-1.021,2.742-1.021 c0.545,1.372,0.203,2.387,0.099,2.64c0.64,0.696,1.024,1.587,1.024,2.675c0,3.833-2.33,4.675-4.552,4.922 c0.355,0.308,0.675,0.916,0.675,1.846c0,1.334-0.012,2.41-0.012,2.737c0,0.267,0.178,0.577,0.687,0.479 C19.146,20.115,22,16.379,22,11.974C22,6.465,17.535,2,12.026,2z" />
		</svg>
	</a>
</footer>
