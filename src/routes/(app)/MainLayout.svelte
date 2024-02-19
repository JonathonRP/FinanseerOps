<svelte:options runes={true} />

<script lang="ts">
	import classes from 'svelte-transition-classes';

	import { cn, merge } from '$/lib/utils';
	import { SignOut } from '@auth/sveltekit/components';

	import toast from 'svelte-french-toast';
	import { AnimatePresence } from 'svelte-motion';

	import logo from '$lib/images/svelte-logo.svg';
	// import dashboard from '@iconify/icons-tabler/chart-infographic';

	import type { Snippet } from 'svelte';
	import Form from '$lib/components/Form.svelte';
	import { icons, navItemIcons } from '$/icons';
	import { userSettings } from '$/lib/stores/userSettings.svelte';
	import { source } from 'sveltekit-sse';
	import { formatISO, intlFormatDistance, parseJSON } from 'date-fns';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import NavLink from './NavLink.svelte';
	import Modal from './Modal.svelte';

	const connection = source('/api/notifications');
	const count = connection.select('count').json();
	const notifications = connection.select('message').json();

	type ModalState =
		| {
				status: 'closed';
				closed: true;
		  }
		| {
				status: 'open';
				open: true;
		  };

	const openModal: ModalState = {
		status: 'open',
		open: true,
	};

	const closeModal: ModalState = {
		status: 'closed',
		closed: true,
	};

	const {
		name = 'Finanzen',
		links,
		session,
		children,
	} = $props<{
		name?: string;
		links?: { route: string }[];
		session: import('./$types').LayoutParentData['session'];
		children: Snippet;
	}>();

	const navIcons = $derived({ ...navItemIcons });

	const routes = $derived(
		merge([{ icon: navIcons.ChartHistogram, label: 'dashboard' }], Object.assign([], [{ route: `${base}/` }], links))
	);

	let menuState: ModalState = $state(closeModal);
	let accountState: ModalState = $state(closeModal);
	let invitationState: ModalState = $state(closeModal);
	let notificationsState: ModalState = $state(closeModal);

	const { user } = $state(session || { user: undefined });
	const { pathname, origin } = $state($page.url);
	const current = $derived({ pathname, origin });

	const toggleAccount = (definedState?: ModalState | undefined) => (event: MouseEvent | KeyboardEvent | Event) => {
		const prevs = document.querySelectorAll('[aria-current="location"]');
		const stateToggle = 'open' in accountState ? closeModal : openModal;

		prevs?.forEach((prev) => {
			prev.ariaCurrent = null;
		});

		switch (event.type) {
			case 'keydown':
				if ((event as KeyboardEvent).key === 'Escape') {
					accountState = definedState ?? stateToggle;
				}
				break;
			case 'click':
				accountState = definedState ?? stateToggle;
				break;
			default:
				accountState = definedState ?? stateToggle;
				break;
		}
		if (accountState) {
			(event.currentTarget as HTMLButtonElement).ariaCurrent = 'location';
		}
	};

	const toggleMenuWidth = (definedState?: ModalState | undefined) => (event: MouseEvent | KeyboardEvent) => {
		const stateToggle = 'open' in menuState ? closeModal : openModal;

		switch (event.type) {
			case 'keydown':
				if ((event as KeyboardEvent).key === 'Escape') {
					menuState = definedState ?? stateToggle;
				}
				break;
			case 'click':
				menuState = definedState ?? stateToggle;
				break;
			default:
				break;
		}
	};

	const toggleInvitation = (definedState?: ModalState | undefined) => (event: MouseEvent | KeyboardEvent) => {
		const stateToggle = 'open' in invitationState ? closeModal : openModal;

		switch (event.type) {
			case 'keydown':
				if ((event as KeyboardEvent).key === 'Escape') {
					invitationState = definedState ?? stateToggle;
				}
				break;
			case 'click':
				invitationState = definedState ?? stateToggle;
				break;
			default:
				invitationState = definedState ?? stateToggle;
				break;
		}
	};

	const toggleNotificationPopover =
		(definedState?: ModalState | undefined) => (event: MouseEvent | KeyboardEvent | Event) => {
			const stateToggle = 'open' in notificationsState ? closeModal : openModal;

			switch (event.type) {
				case 'keydown':
					if ((event as KeyboardEvent).key === 'Escape') {
						notificationsState = definedState ?? stateToggle;
					}
					break;
				case 'click':
					notificationsState = definedState ?? stateToggle;
					break;
				default:
					notificationsState = definedState ?? stateToggle;
					break;
			}
		};

	let useBauhaus = $state(userSettings.useBauhaus);

	const userImage = $derived(userSettings.genertateImage(user));
</script>

<svelte:window
	on:keydown={(e) => {
		toggleAccount(closeModal)(e);
		toggleMenuWidth(closeModal)(e);
		toggleInvitation(closeModal)(e);
	}} />
{#if user?.role === 'admin'}
	<dialog
		id="inviteUser"
		onclick={toggleInvitation(closeModal)}
		onkeydown={toggleInvitation(closeModal)}
		open={invitationState.status === 'open'}
		class="rounded-2xl bg-white text-neutral-808 open:relative dark:bg-neutral-800 dark:text-neutral-309">
		<Form
			method="post"
			action="/user?/invite"
			reset={true}
			let:submitting
			let:valid
			let:handleBlur
			let:handleInput
			on:success={(e) => {
				toggleInvitation(closeModal);
				toast.success(`Sent invitation to ${e?.detail?.data.get('email')}.`);
			}}
			class="flex w-full items-center border-b py-2 transition-colors focus-within:border-primary-500 hover:border-primary-400">
			<svelte:component this={icons.PlusUserIcon} class="mr-2 flex h-6 w-12 items-center" height="auto" inline />
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
			<button type="button" formmethod="dialog" value="cancel" class="absolute right-0 top-0">
				<span class="flex items-center justify-center">
					<svelte:component this={icons.CloseIcon} class="h-6 w-6" height="auto" inline />
				</span>
			</button>
			<button
				type="submit"
				class="item-center flex flex-shrink-0 justify-center rounded-full border-4 border-primary-500 bg-primary-500 px-2 py-1 text-sm text-white transition-colors hover:border-primary-600 hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 disabled:border-primary-700 disabled:bg-primary-700 dark:focus:ring-offset-neutral-808"
				aria-busy={submitting}
				disabled={!valid || submitting}>
				<svelte:component this={icons.LoadingIcon} class="{submitting ? 'flex' : 'hidden'} fixed" inline />
				Invite
			</button>
		</Form>
	</dialog>
{/if}
<!-- side-bar -->
<aside class="flex flex-shrink-0 transition-all">
	<div class="fixed inset-0 z-10 hidden w-16 md:flex" class:sm:hidden={accountState.status === 'closed'} />
	<!-- Mobile bottom bar -->
	<nav
		aria-label="Options"
		class="shadow-t fixed inset-x-0 bottom-0 z-10 flex flex-row items-center justify-between rounded-t-2xl bg-white px-3 py-2 md:hidden dark:bg-gray-800 dark:shadow-neutral-309/20">
		<!-- Links -->
		<ul class="flex-1 space-x-2 overflow-hidden hover:overflow-auto">
			{#each routes as { icon, route, label }, id (id)}
				<li>
					<NavLink active={current.pathname === new URL(route, current.origin).pathname} {icon} {route}>
						{label}
					</NavLink>
				</li>
			{/each}
		</ul>
		<div class="flex items-center gap-3">
			{#if user?.role === 'admin'}
				<button
					type="button"
					onclick={toggleInvitation()}
					class="rounded-lg opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-808">
					<span class="flex items-center justify-center rounded-lg p-1 shadow-md">
						<svelte:component this={icons.PlusUserIcon} class="h-6 w-6" height="auto" inline />
					</span>
					<span class="sr-only">expand invitation</span>
				</button>
			{/if}
			<button
				type="button"
				onclick={toggleNotificationPopover()}
				class="rounded-lg opacity-80 shadow-sm transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white @[5rem]:mx-4 @[5rem]:w-11/12 @[5rem]:space-x-2 dark:shadow-neutral-600 dark:focus:ring-offset-neutral-808">
				<span class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
					<svelte:component this={icons.BellIcon} class="h-8 w-6" height="auto" inline />
					{#if Number($count) > 0}
						<span
							class="absolute right-1 top-2 flex items-center justify-center rounded-lg bg-primary-400 px-1 text-xs ring-2 ring-neutral-309 ring-offset-1 ring-offset-neutral-808 dark:ring-neutral-808"
							>{$count}</span>
					{/if}
				</span>
				<span class="sr-only">Toggle notifications</span>
			</button>
			<button
				type="button"
				onclick={toggleAccount()}
				class="rounded-lg opacity-80 shadow-sm transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white dark:shadow-neutral-600 dark:focus:ring-offset-neutral-808">
				<img class="h-8 w-8 rounded-lg shadow-md" src={userImage} alt="user profile" />
				<span class="sr-only">User menu</span>
			</button>
		</div>
	</nav>

	<!-- Left mini bar -->
	<nav
		aria-label="Options"
		class="fixed inset-0 z-20 hidden w-16 flex-shrink-0 flex-col items-center py-4 transition-[width] duration-300 @container md:static md:flex dark:shadow-neutral-309/20"
		class:w-64={menuState.status === 'open'}
		class:sm:w-72={menuState.status === 'open'}
		class:rounded-none={false}
		class:border-r-0={false}
		class:shadow-none={false}>
		<!-- Logo -->
		<div class="flex flex-shrink-0 px-4 py-4">
			<h2 class="text-xl font-bold @2xs:hidden">fz</h2>
			<h2 class="hidden text-xl font-bold @[5rem]:flex @[5rem]:flex-1 @[5rem]:justify-center">{name}</h2>
		</div>
		<div class="flex w-full flex-1 flex-col items-center space-y-3 p-2">
			<!-- Menu button -->

			<!-- <button
				class="rounded-lg bg-white p-2 text-gray-500 shadow-md transition-colors hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 aria-[current=location]:bg-primary-600 aria-[current=location]:text-white dark:bg-gray-800 dark:shadow-neutral-309/20 dark:focus:ring-offset-neutral-808"
				onclick={toggleMenuWidth()}>
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
			</button> -->
			<!-- Links -->
			<ul class="w-full flex-1 space-y-2 @[6rem]:px-4">
				{#each routes as { icon, route, label }, id (id)}
					<li>
						<NavLink active={current.pathname === new URL(route, current.origin).pathname} {icon} {route}>
							{label}
						</NavLink>
					</li>
				{/each}
			</ul>

			{#if user?.role === 'admin'}
				<button
					type="button"
					onclick={toggleInvitation()}
					class="relative rounded-lg opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white @[12rem]:flex @[12rem]:w-full @[12rem]:items-center @[12rem]:space-x-2 @[12rem]:px-4 dark:focus:ring-offset-neutral-808">
					<span class="flex items-center rounded-lg p-1 shadow-md">
						<svelte:component this={icons.PlusUserIcon} class="h-6 w-6" height="auto" inline />
					</span>
					<span class="invisible @[6rem]:visible">invintation</span>
					<span class="sr-only">expand invitation</span>
				</button>
			{/if}
		</div>
		<div class="mt-2 flex flex-shrink-0 flex-col items-center justify-between gap-4 px-2 @[12rem]:w-full">
			<button
				type="button"
				onclick={toggleNotificationPopover()}
				class="relative flex items-center rounded-lg opacity-80 shadow-sm transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white @[5rem]:mx-4 @[5rem]:w-11/12 @[5rem]:space-x-2 dark:shadow-neutral-600 dark:focus:ring-offset-neutral-808">
				<span class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
					<svelte:component this={icons.BellIcon} class="h-8 w-6" height="auto" inline />
					{#if Number($count) > 0}
						<span
							class="absolute right-1 top-2 flex items-center justify-center rounded-lg bg-primary-400 px-1 text-xs ring-2 ring-neutral-309 ring-offset-1 ring-offset-neutral-808 dark:ring-neutral-808"
							>{$count}</span>
					{/if}
				</span>
				<span class="invisible @[12rem]:visible">notifications</span>
				<span class="sr-only">Toggle notifications</span>
			</button>
			<button
				type="button"
				onclick={toggleAccount()}
				class="relative flex items-center rounded-lg opacity-80 shadow-sm transition-opacity hover:opacity-100 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-white @[5rem]:mx-4 @[5rem]:w-11/12 @[5rem]:space-x-2 dark:shadow-neutral-600 dark:focus:ring-offset-neutral-808">
				<span class="flex flex-shrink-0 items-center rounded-lg">
					<img class="h-10 w-10" src={userImage} alt="user profile" />
				</span>
				<span class="hidden @[12rem]:flex">{user?.name}</span>
				<span class="sr-only">user menu</span>
			</button>
		</div>
	</nav>

	<AnimatePresence show={accountState.status === 'open'}>
		{#if accountState.status === 'open'}
			<div
				in:classes={{
					duration: 300,
					base: 'md:transition md:duration-250',
					from: 'md:-translate-x-1/2 md:opacity-0',
					to: 'md:translate-x-0 md:opacity-100',
				}}
				out:classes={{
					duration: 250,
					base: 'md:transition md:duration-150',
					from: 'md:translate-x-0 md:opacity-100',
					to: 'md:-translate-x-1/2 md:opacity-0',
				}}
				class="md:static md:inset-y-0 md:left-16 md:mx-0 md:h-auto md:w-72 md:bg-inherit md:shadow-none md:dark:bg-inherit">
				<Modal
					on:close={(e) => {
						toggleAccount(closeModal)(e);
					}}>
					<div aria-label="User Account Settings" class="flex h-full flex-col md:px-4">
						<div class="flex flex-1 flex-col py-10">
							<!-- Account -->
							<div class="flex flex-shrink-0 items-center justify-center">
								<button type="button" class="h-20 w-20 rounded-full">
									<img src={userImage} alt="user profile" />
								</button>
							</div>

							<!-- UserSetting -->
							<div class="flex flex-shrink-0 px-4 py-2">
								<Form
									method="post"
									action="/user?/update"
									let:submitting
									let:valid
									let:handleBlur
									let:handleInput
									validate={(values) => {
										const errors = { username: '', useBauhaus: '' };

										if (values.username === user?.name && Boolean(values.useBauhaus) === useBauhaus) {
											errors.username = 'No changes to submit.';
										}

										return errors;
									}}
									on:submit={(e) => {
										const form = Object.fromEntries(e.detail.data);

										if (Boolean(form.useBauhaus) !== useBauhaus) {
											useBauhaus = Boolean(form.useBauhaus);
											toast.success(`Now using ${useBauhaus ? 'Bauhaus' : 'Beam'} avatar.`);
										}

										if (user) {
											if (user.name === form.username) {
												return false;
											}
											user.name = form.username;
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
											checked={useBauhaus}
											on:blur={handleBlur}
											on:input={handleInput}
											disabled={submitting} />
										<span class="text-sm">Use Buasuah</span>
									</label>
									<button
										type="submit"
										class="item-center flex w-full justify-center rounded-full bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 disabled:bg-primary-700 dark:focus:ring-offset-neutral-808"
										aria-busy={submitting}
										disabled={!valid || submitting}>
										<svelte:component this={icons.LoadingIcon} class="{submitting ? 'flex' : 'hidden'} fixed" inline />
										Save Settings
									</button>
								</Form>
							</div>
						</div>

						{#if user}
							<div class="flex-shrink-0 py-4">
								<SignOut
									signOutPage="auth"
									className="group flex w-full items-center space-x-2 rounded-lg text-primary-600 transition-colors hover:bg-primary-500 hover:text-white dark:text-neutral-309">
									<span
										aria-hidden="true"
										class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-primary-600 group-hover:text-white group-aria-[current=page]:bg-primary-600">
										<svelte:component this={icons.LogOutIcon} class="h-6 w-6" height="auto" flip="vertical" />
									</span>
									<span>Sign Out</span>
								</SignOut>
							</div>
						{/if}
					</div>
				</Modal>
			</div>
		{/if}
	</AnimatePresence>

	<AnimatePresence show={notificationsState.status === 'open'}>
		{#if notificationsState.status === 'open'}
			<div
				in:classes={{
					duration: 300,
					base: 'md:transition md:transition-position md:duration-250',
					from: 'md:-translate-x-full md:opacity-0',
					to: 'md:translate-x-0 md:opacity-100',
				}}
				out:classes={{
					duration: 250,
					base: 'md:transition md:transition-position md:duration-150',
					from: 'md:translate-x-0 md:opacity-100',
					to: 'md:-translate-x-1/3 md:opacity-0',
				}}
				class="md:static md:inset-y-0 md:left-16 md:mx-0 md:h-auto md:w-72 md:bg-inherit md:shadow-none md:dark:bg-inherit">
				<Modal
					on:close={(e) => {
						toggleNotificationPopover(closeModal)(e);
					}}>
					<div aria-label="Notifications" class="flex h-full flex-col md:px-2">
						<div class="flex flex-1 flex-col py-10">
							<!-- notifications -->
							<div class="flex flex-shrink-0 items-center justify-center pb-2">
								<header>Notifications</header>
							</div>
							<ul
								class={cn('flex h-full flex-shrink-0 flex-col gap-2 px-2 py-4', {
									'justify-center': !$notifications?.length,
								})}>
								{#each $notifications as notification}
									{#snippet notificationItem({icon, actions}: {icon?: icons.BellIcon, actions?: [{primary: string}, {secondary: string}]})}
										<li
											class={cn('flex gap-1 rounded-md p-2 text-xs ring-1 transition-colors', {
												'text-yellow-400 ring-yellow-600 hover:bg-yellow-600 hover:text-yellow-300': !icon,
												'text-emerald-600 ring-emerald-800 hover:bg-emerald-800 hover:text-emerald-500':
													icon === icons.MoneyIcon,
												'text-blue-200 ring-blue-400 hover:bg-blue-400 hover:text-blue-500': icon === icons.InviteIcon,
											})}>
											<a class="flex w-full items-center gap-2" href="/">
												<div class="flex flex-shrink-0 items-center justify-center">
													<svelte:component this={icon ?? icons.BellIcon} class="h-8 w-6" height="auto" inline />
												</div>
												<div class="flex flex-col text-left">
													<p class="text-balance">{notification.message}</p>
													<time
														datetime={formatISO(parseJSON(notification.createdOn))}
														class="text-neutral-808 dark:text-neutral-309"
														>{intlFormatDistance(parseJSON(notification.createdOn), new Date())}</time>
												</div>
											</a>
											<div class="flex flex-col items-end gap-2">
												{#if !actions || actions?.length < 2}
													<button
														class={cn('w-4', {
															'text-yellow-400 hover:text-yellow-200': !icon,
															'text-emerald-600 hover:text-emerald-400': icon === icons.MoneyIcon,
															'text-blue-200 hover:text-blue-400': icon === icons.InviteIcon,
														})}>
														<svelte:component this={icons.CloseIcon} class="h-4 w-4" height="auto" inline />
													</button>
												{/if}
												<div class="flex flex-shrink-0 flex-col gap-2 font-bold">
													<button
														class={cn('rounded-md px-2 py-1 text-white transition-colors', {
															'bg-yellow-700 hover:bg-yellow-500': !icon,
															'bg-emerald-900 hover:bg-emerald-700': icon === icons.MoneyIcon,
															'bg-blue-500 hover:bg-blue-600': icon === icons.InviteIcon,
														})}>{actions?.[0].primary ?? 'seen'}</button>
													{#if actions?.[1].secondary}
														<button
															class={cn('rounded-md px-2 py-1 font-normal ring-1', {
																'text-yellow-400 ring-yellow-700 hover:text-yellow-500 hover:ring-yellow-400': !icon,
																'text-emerald-600 ring-emerald-900 hover:text-emerald-700 hover:ring-emerald-600':
																	icon === icons.MoneyIcon,
																'text-blue-200 ring-blue-500 hover:text-blue-600 hover:ring-blue-600':
																	icon === icons.InviteIcon,
															})}>{actions?.[1].secondary}</button>
													{/if}
												</div>
											</div>
										</li>
									{/snippet}
									{#if notification.type === 'invite'}
										{@render notificationItem({
											icon: icons.InviteIcon,
											actions: [{ primary: 'accept' }, { secondary: 'reject' }],
										})}
									{:else if notification.type === 'account'}
										{@render notificationItem({ icon: icons.MoneyIcon })}
									{:else}
										{@render notificationItem()}
									{/if}
								{:else}
									<li class="stroke-slate-300 flex flex-col space-y-px items-center">
										<svg
											id="SvgjsSvg1048"
											width="215"
											height="240"
											xmlns="http://www.w3.org/2000/svg"
											version="1.1"
											xmlns:xlink="http://www.w3.org/1999/xlink"
											xmlns:svgjs="http://svgjs.com/svgjs"
											><defs id="SvgjsDefs1049"></defs><g id="SvgjsG1050"
												><svg
													xmlns="http://www.w3.org/2000/svg"
													data-name="Layer 2"
													viewBox="0 0 1000 1000"
													width="215"
													height="240"
													><path
														fill="currentColor"
														d="m637.88,837.22c-16.28,60.79-71.75,105.56-137.67,105.56s-121.4-44.77-137.67-105.56h275.34Z"
														class="colora7d0f9 svgShape"></path
													><path
														fill="currentColor"
														d="m594.37,159.19c-27.72-6.42-59.33-9.94-95.38-9.94-31.09,0-58.89,2.62-83.74,7.46,4.06-45.86,42.56-81.81,89.47-81.81s86.79,37.25,89.65,84.28Z"
														opacity=".75"
														class="colora7d0f9 svgShape"></path
													><path
														fill="currentColor"
														d="m807.33,596.7c-99.03-5.41-202.26-8.27-308.34-8.27s-209.31,2.87-308.34,8.27c1.46-5.12,2.76-10.31,3.89-15.55,20.43-94.56-32.55-375.07,220.71-424.43,24.84-4.84,52.64-7.46,83.74-7.46,36.05,0,67.66,3.51,95.38,9.94,240,55.6,188.97,328.87,209.07,421.96,1.13,5.25,2.44,10.43,3.89,15.55Z"
														opacity=".25"
														class="colora7d0f9 svgShape"></path
													><path
														fill="currentColor"
														d="m747.95,267.64c-18.32-9.31-39.12-16.89-62.73-22.36-27.72-6.42-59.33-9.93-95.38-9.93-31.09,0-58.89,2.62-83.74,7.46-202.94,39.55-209.24,227.54-214.25,349.32-34.18,1.23-67.93,2.76-101.2,4.57,1.45-5.12,2.76-10.3,3.89-15.55,20.43-94.56-32.55-375.07,220.71-424.43,24.85-4.84,52.65-7.46,83.74-7.46,36.05,0,67.66,3.51,95.38,9.93,77.44,17.94,124.58,58.55,153.58,108.45Z"
														opacity=".25"
														class="colora7d0f9 svgShape"></path
													><path
														fill="currentColor"
														d="m914.36,785.61h0c0,28.5-23.11,51.61-51.6,51.61H135.22c-28.49,0-51.6-23.11-51.6-51.6,0-6.63,1.27-13.14,3.69-19.18,2.4-6.04,5.96-11.64,10.55-16.42,24.22-25.3,72.74-82.59,92.79-153.32,99.03-5.41,202.26-8.27,308.34-8.27s209.31,2.87,308.34,8.27c20.07,70.72,68.59,128.01,92.79,153.32,9.16,9.58,14.24,22.33,14.24,35.59Z"
														opacity=".5"
														class="colora7d0f9 svgShape"></path
													><path
														fill="currentColor"
														d="m862.76,840.22H135.22c-30.11,0-54.6-24.49-54.6-54.6,0-6.99,1.31-13.82,3.9-20.29,2.59-6.5,6.34-12.35,11.17-17.38,25.98-27.14,72.49-82.99,92.07-152.06,1.46-5.14,2.76-10.31,3.85-15.37,4.12-19.06,5.22-45.98,6.5-77.14,2.53-61.63,5.67-138.33,33.6-205.38,15.23-36.56,36.7-66.82,63.82-89.94,31.35-26.72,71.44-44.98,119.15-54.28,25.6-4.99,53.97-7.52,84.31-7.52,35.07,0,67.39,3.37,96.06,10.01,45.07,10.44,82.93,29.38,112.54,56.3,25.62,23.29,45.91,53.37,60.32,89.41,26.43,66.12,29.5,141.14,31.97,201.42,1.28,31.16,2.38,58.06,6.49,77.12,1.09,5.07,2.39,10.23,3.85,15.36,19.59,69.04,66.1,124.91,92.08,152.06,9.72,10.16,15.07,23.53,15.07,37.66,0,30.12-24.49,54.61-54.6,54.61ZM498.99,152.26c-29.96,0-57.94,2.49-83.16,7.41-199.21,38.83-206.74,222.45-211.72,343.95-1.29,31.44-2.4,58.6-6.63,78.17-1.12,5.18-2.44,10.48-3.94,15.74-19.94,70.31-67.15,127.02-93.51,154.57-4.29,4.47-7.63,9.67-9.93,15.45-2.31,5.77-3.47,11.85-3.47,18.07,0,26.8,21.8,48.6,48.6,48.6h727.54c26.8,0,48.6-21.8,48.6-48.6,0-12.59-4.76-24.49-13.4-33.52-26.36-27.56-73.57-84.28-93.51-154.57-1.49-5.25-2.82-10.55-3.94-15.74-4.22-19.56-5.33-46.71-6.62-78.14-4.86-118.66-12.2-297.98-200.19-341.53-28.23-6.54-60.09-9.86-94.7-9.86Z"
														class="colora7d0f9 svgShape"></path
													><rect
														width="424.81"
														height="6"
														x="128.46"
														y="736.27"
														fill="currentColor"
														class="colora7d0f9 svgShape"></rect
													><rect
														width="285.57"
														height="6"
														x="434.09"
														y="762.24"
														fill="currentColor"
														class="colora7d0f9 svgShape"></rect
													><rect
														width="153.4"
														height="6"
														x="628.79"
														y="736.27"
														fill="currentColor"
														class="colora7d0f9 svgShape"></rect
													><path
														fill="currentColor"
														d="M734.4 392.85c-12.02-70.33-54.43-117.9-87.88-145.42-36.39-29.93-70.39-43.33-70.73-43.46l2.17-5.59c.35.13 35.1 13.8 72.21 44.29 21.81 17.92 40.2 38.07 54.66 59.9 18.09 27.33 30.03 57.36 35.49 89.27l-5.91 1.01zM409.92 443.35c-21.65 0-33.31-7.57-39.28-13.93-6.64-7.07-7.94-14.22-7.99-14.52l5.91-1.02-2.96.51 2.95-.53c.18.96 4.74 23.49 41.36 23.49s42.5-22.67 42.73-23.63l5.85 1.33c-.26 1.16-6.82 28.3-48.58 28.3zM589.17 443.35c-21.65 0-33.31-7.57-39.28-13.93-6.64-7.07-7.94-14.22-7.99-14.52l5.91-1.02-2.96.51 2.95-.53c.18.96 4.74 23.49 41.36 23.49s42.5-22.67 42.73-23.63l5.85 1.33c-.26 1.16-6.82 28.3-48.58 28.3z"
														class="colora7d0f9 svgShape"></path
													><g opacity=".75" fill="#000000" class="color000 svgShape"
														><path
															fill="currentColor"
															d="m534.7,530.13c0,10.51-13.04,19.18-29.96,20.55h-.01c-1.54.15-3.13.21-4.73.21-19.16,0-34.7-9.29-34.7-20.76s15.54-20.75,34.7-20.75,34.7,9.29,34.7,20.75Z"
															class="colora7d0f9 svgShape"></path
														></g
													><g opacity=".75" fill="#000000" class="color000 svgShape"
														><path
															fill="currentColor"
															d="m531.64,611.38c-17.04,2.79-1.95-31.76-9.69-31.76s-.62,22.93-12.09,22c-11.45-.93-5.13-50.93-5.13-50.93h.01c16.91-1.38,29.96-10.06,29.96-20.57,0,0,13.97,78.47-3.06,81.25Z"
															class="colora7d0f9 svgShape"></path
														></g
													><g opacity=".75" fill="#000000" class="color000 svgShape"
														><path
															fill="currentColor"
															d="M773.52 185.69h44.27v17.18h-72.14v-11.77l44.15-63.61h-44.4v-17.24h71.95v11.45l-43.83 64zM857.42 138.88h34.36v13.33h-55.98v-9.13l34.26-49.36h-34.45v-13.38h55.83v8.89l-34.01 49.66z"
															class="colora7d0f9 svgShape"></path
														></g
													><g opacity=".25" fill="#000000" class="color000 svgShape"
														><path
															fill="currentColor"
															d="M87.21 580.44h107.48c8.26-39.31 4.24-109.96 14.43-182.85-11.35 5.41-24.05 8.45-37.47 8.45h-84.44c-48.16 0-87.21 39.04-87.21 87.21 0 24.08 9.76 45.88 25.54 61.65 15.79 15.79 37.58 25.54 61.66 25.54zM362.54 837.22h-227.32c-28.49 0-51.6-23.11-51.6-51.6 0-6.63 1.27-13.14 3.69-19.18 1.63-4.11 3.82-8 6.48-11.58h-6.57c-48.16 0-87.21 39.04-87.21 87.19 0 24.08 9.76 45.88 25.54 61.66 15.79 15.79 37.58 25.54 61.66 25.54h352.4c-37.55-17.67-66.15-51.24-77.07-92.04zM87.21 231.63h84.44c24.08 0 45.88 9.76 61.66 25.54 5.04 5.04 9.45 10.7 13.14 16.84 30.01-55.29 80.99-100.19 168.79-117.3 4.06-45.86 42.56-81.81 89.47-81.81s86.79 37.25 89.65 84.28c77.74 18.01 124.94 58.86 153.91 109.03 15.82-22.14 41.71-36.59 70.99-36.59h93.51c48.16 0 87.21-39.05 87.21-87.21 0-24.08-9.76-45.88-25.54-61.66-15.79-15.79-37.58-25.54-61.66-25.54H87.21C39.05 57.22 0 96.27 0 144.43c0 24.08 9.76 45.88 25.54 61.66 15.79 15.79 37.58 25.54 61.66 25.54zM835.61 80.34h55.83v8.89l-34.01 49.66h34.36v13.33h-55.98v-9.13l34.26-49.36h-34.45v-13.38zm-90.21 29.9h71.95v11.45l-43.83 64h44.27v17.18h-72.14v-11.77l44.15-63.61h-44.4v-17.24zM912.79 754.86h-8.6c6.58 8.84 10.17 19.62 10.17 30.75h0c0 28.5-23.11 51.61-51.6 51.61h-224.87c-10.93 40.8-39.53 74.36-77.08 92.04h351.99c48.16 0 87.21-39.05 87.21-87.21 0-24.08-9.76-45.88-25.54-61.65-15.79-15.79-37.58-25.54-61.66-25.54zM912.79 406.04h-93.51c-10.53 0-20.63-1.87-29.98-5.29 9.7 72.21 5.8 141.8 14.14 180.4 1.13 5.25 2.44 10.43 3.89 15.55 3.31 11.65 7.39 22.92 12.01 33.75 13.96-29.56 44.03-50.02 78.89-50.02h14.57c48.16 0 87.21-39.04 87.21-87.19 0-24.08-9.76-45.89-25.54-61.66-15.79-15.79-37.58-25.54-61.66-25.54z"
															class="colora7d0f9 svgShape"></path
														></g
													></svg
												></g
											></svg>
										<span class="text-lg font-bold text-gray-300">No Notifications</span>
										<span class="text-base text-gray-300">You're all caught up</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</Modal>
			</div>
		{/if}
	</AnimatePresence>
</aside>

<main class="flex flex-1 flex-col overflow-hidden px-6 pb-16 pt-8 md:px-0 md:pb-16 md:pr-8 md:pt-4">
	<nav class="hidden md:flex md:h-16 md:gap-2 md:pt-2.5">
		<button
			class="fixed z-20 rounded-lg bg-white p-2 text-gray-500 shadow-md transition-colors hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white focus:outline-none focus:ring focus:ring-primary-600 focus:ring-offset-2 dark:bg-gray-800 dark:shadow-neutral-309/20 dark:focus:ring-offset-neutral-808"
			onclick={toggleMenuWidth()}>
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
	<div class="mt-2 grid h-full md:flex md:overflow-hidden md:rounded-2xl md:bg-slate-200 md:dark:bg-neutral-808">
		{@render children()}
	</div>
</main>

<footer class="fixed bottom-20 right-5 flex items-center gap-4 md:bottom-5">
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

<style lang="postcss">
	@media (min-width: 768px) {
		@container (max-width: 12rem) {
			nav[aria-label='Options'] div > button:first-of-type:hover > span:nth-of-type(2) {
				left: 50px;
				opacity: 1;
				visibility: visible;
			}

			nav[aria-label='Options'] div > button:first-of-type > span:nth-of-type(2) {
				background-color: #000;
				color: #fff;
				position: absolute;
				left: 70px;
				top: 50%;
				transform: translateY(-50%);
				padding: 10px;
				border-radius: 4px;
				opacity: 0;
				visibility: hidden;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

				&:after {
					content: '';
					background-color: #000;
					position: absolute;
					left: -5px;
					top: 20%;
					width: 20px;
					height: 20px;
					border-radius: 2px;
					transform: rotate(45deg);
					z-index: -1;
				}
			}
		}
	}
</style>
