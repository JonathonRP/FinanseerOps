<svelte:options runes={true} />

<script lang="ts">
	import { icons } from '$/icons';
	import AnimatedNumber from '$/lib/components/AnimatedNumber.svelte';
	import { Button } from '$/lib/components/ui/button';
	import { Drawer } from '$/lib/components/ui/drawer';
	import { Form } from '$/lib/components/ui/form';
	import { Select } from '$/lib/components/ui/select';
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate, goto, preloadData, pushState } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { ease } from '$lib/animations';
	import { Motion } from '$lib/components';
	import { Tabs } from '$lib/components/ui/tabs';
	import { cn, compareDates, compareMonths, datePeriods, intlFormatDistance, numberFormat } from '$lib/utils';
	import { from, map, startWith } from 'rxjs';
	import { type Snippet } from 'svelte';
	import { AnimatePresence, type Variants } from 'svelte-motion';
	import DateSelect from './DateSelect.svelte';
	import Cashflow from './cashflow/+page.svelte';
	import Categories from './categories/+page.svelte';

	const { data, children }: { data: import('./$types').LayoutData; children: Snippet } = $props();
	const { user, current, processedDay, searchFilter, bankAccounts, bankTransactions } = $derived(data);

	const subPages = new Map([
		['Cash Flow', [Cashflow, 'cashflow'] as const],
		['Categories', [Categories, 'categories'] as const],
	]);

	const subpage = $derived($page.state.subpage);

	const tab = $derived(current.pathname.split('/').pop() ?? 'overview');

	const mostRecentTransactions = $derived(
		from(bankTransactions).pipe(
			map((result) =>
				result
					.filter(async ({ date }) => compareMonths(date, processedDay) === 0 && compareDates(date, processedDay) <= 0)
					.splice(0, 10)
			)
		)
	);

	const expenseTotal = $derived(
		mostRecentTransactions.pipe(
			map((result) => result.filter(({ type }) => type === 'expense').reduce((acc, { amount }) => acc + amount, 0)),
			startWith(0)
		)
	);

	const direction = $derived(tab === 'overview' ? -1 : 1);

	const horizontalSlide: Variants = {
		hidden: (direct) => ({
			x: `${-100 * direct}%`,
			opacity: 0,
			zIndex: 0,
			transition: {
				duration: 0.8,
				ease,
			},
		}),
		visible: {
			x: '0%',
			opacity: 1,
			zIndex: 1,
			transition: {
				duration: 0.8,
				ease,
			},
		},
		leave: (direct) => ({
			x: `${100 * direct}%`,
			opacity: 0,
			zIndex: 0,
			transition: {
				duration: 0.8,
				ease,
			},
		}),
	};

	const freeFall: Variants = {
		visible: {
			y: '0%',
			opacity: 1,
		},
		leave: {
			y: `100%`,
			opacity: 0,
		},
	};

	const date: Variants = $derived({
		visible: {
			opacity: 1,
		},
		leave: {
			opacity: 0,
			transition: {
				duration: 0.8,
				opacity: {
					duration: tab === 'overview' ? 0.5 : 0.25,
				},
			},
		},
	});

	let loading = $state(false);
	let mounting = $state(true);

	beforeNavigate((nav) => {
		if (nav.from?.route.id === nav.to?.route.id) return;
		if (nav.willUnload && nav.type === 'leave') {
			mounting = true;
			return;
		}

		loading = true;
	});

	afterNavigate(async (nav) => {
		if (nav.type === 'enter') {
			mounting = false;
		}
		if (!nav.willUnload) {
			await nav.complete;
			loading = false;
		}
	});

	$effect(() => {
		if (mounting) mounting = false;
	});

	async function handleSubpageChange(event: MouseEvent & { currentTarget: HTMLAnchorElement }) {
		if (event.metaKey || event.ctrlKey) return;
		event.preventDefault();
		const { href } = event.currentTarget;
		const result = await preloadData(href);

		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { subpage: true });
		} else {
			goto(href);
		}
	}

	// $inspect(mounting, loading);
</script>

<AnimatePresence initial={false} show={loading || mounting}>
	<Motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		class="fixed inset-0 z-20 hidden touch-none backdrop-blur-[0.4rem] select-none"></Motion.div>
</AnimatePresence>
<AnimatePresence show={!loading && !mounting} custom={direction}>
	<header
		class="from-accent-700 to-accent-600 dark:from-accent-600 dark:to-accent-700 hidden bg-gradient-to-b py-8 px-4 pb-36 md:block">
		<div class="mb-14 flex w-full items-center justify-between"></div>
		<div class="mb-4 space-y-2">
			<h2 class="text-2xl font-medium">
				Hello, <span class="text-accent-400 font-light">{user?.name}</span>! Welcome back{tab === 'overview'
					? ', to your dashboard'
					: ''}.
			</h2>
		</div>
		<div class="relative z-20 hidden flex-col items-center gap-y-2 md:flex md:flex-row md:gap-x-2 md:gap-y-0">
			<Form.Root
				method="post"
				action="/user?/update"
				values={(({
								permittedBankAccounts,
							}: Partial<{ permittedBankAccounts: number[] | null }>) => ({
								permittedBankAccounts,
							}))(user)}
				validate={(values, errors) => {
					if (values?.permittedBankAccounts === user?.permittedBankAccounts) {
						const errorMessage = 'No changes to submit.';
						errors.permittedBankAccounts = errorMessage;
					}

					return errors;
				}}
				onsucceeded={async (data, invalidate, invalidateAll) => {
					await invalidateAll();
				}}>
				{#snippet children({ formData, handleInput, submitting })}
					{#await bankAccounts then accounts}
						<Select.Root
							multiple
							name="permittedBankAccounts"
							selected={formData?.permittedBankAccounts?.map((value) => ({
								label: accounts.find((account) => account.id === Number(value))?.name,
								value: String(value),
							}))}
							onSelectedChange={(values) =>
								handleInput({
									currentTarget: { name: 'permittedBankAccounts', value: values?.map(({ value }) => value) },
								})}
							disabled={submitting}>
							{#each formData?.permittedBankAccounts ?? [] as bankAccount (bankAccount)}
								<input type="hidden" name="permittedBankAccounts" value={bankAccount} />
							{/each}
							<Select.Trigger
								class="bg-background/10 hover:bg-background/20 focus:bg-background/30 h-9 w-full rounded-md border-none px-3 font-normal outline-none transition focus:ring-transparent focus:ring-offset-0 lg:w-auto">
								<Select.Value placeholder="Select accounts" />
							</Select.Trigger>
							<Select.Content>
								{#each accounts as { id: bankAccountId, name: bankAccountName } (bankAccountId)}
									<Select.Item value={bankAccountId.toString()} label={bankAccountName} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/await}
				{/snippet}
			</Form.Root>
			<form action="" method="get">
				<Select.Root name="processedPeriod">
					<Select.Trigger
						class="bg-background/10 hover:bg-background/20 focus:bg-background/30 h-9 w-full rounded-md border-none px-3 font-normal outline-none transition focus:ring-transparent focus:ring-offset-0 lg:w-auto">
						<Select.Value placeholder="select processed period (date range)" />
					</Select.Trigger>
					<Select.Content>
						{#each datePeriods as [label, value]}
							<Select.Item {value} {label} />
						{/each}
					</Select.Content>
				</Select.Root>
			</form>
			<AnimatePresence show={current.pathname.includes('transactions')}>
				<Motion.form
					action=""
					method="get"
					class={cn('border-neutral-808 dark:border-neutral-309 mx-2 my-auto flex h-9 grow rounded-full border-2')}
					transition={{ duration: 0.8, staggerChildren: 0.35, ease }}
					initial={!mounting
						? {
								opacity: 0,
								x: '100%',
							}
						: false}
					animate={{
						opacity: 1,
						x: 0,
					}}
					exit={{
						opacity: 0,
						x: '100%',
					}}
					onformdata={(e) => {
						Array.from(e.formData.entries()).reduce((acc, [k, v]) => {
							!v && e.formData.delete(k);
							return acc;
						});
					}}>
					<span class="mx-[0.625rem] my-[0.525rem] flex border-spacing-0 items-center rounded-full text-base font-bold">
						<svelte:component this={icons.SearchIcon} inline />
					</span>
					<input type="hidden" name="processedDate" value={Temporal.PlainDate.from(processedDay).toLocaleString()} />
					<input
						name="search"
						class="w-full rounded-full border-none bg-inherit px-3 autofill:bg-[none_!important] max-sm:text-xs lg:text-lg"
						value={searchFilter} />
				</Motion.form>
			</AnimatePresence>
		</div>
	</header>
	<div
		class="grid w-full grid-cols-1 justify-between max-md:space-y-2 md:-mt-80 md:h-[calc(100dvh_-_9em)] md:gap-4 md:py-2 md:px-4 xl:grid-flow-col xl:grid-cols-[minmax(0,_1fr)_auto]">
		<Tabs.Root
			value={tab}
			activateOnFocus={false}
			onValueChange={async (value) => {
				if (browser) {
					let location = `${base}`;
					// if (value === 'transactions') location = location.concat(current.pathname.split('/').pop() ?? '');

					await goto(`${location}/${value?.concat(current.search)}`);
				}
			}}>
			<Tabs.List class="hidden w-max grid-cols-2 md:mb-[9.5rem] md:grid">
				<!-- lg:-ml-6 -->
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
			</Tabs.List>

			<Motion.div initial="hidden" animate="visible" exit="leave" custom={direction * -1}>
				<Tabs.Content value={tab}>
					<Motion.section
						variants={horizontalSlide}
						class={cn('@container relative mx-auto size-full sm:mt-0 md:mx-0 md:pt-14', {
							'md:pr-4': tab === 'overview',
							'md:pt-20': tab === 'transactions',
						})}
						custom={direction}>
						{@render children()}
					</Motion.section>
				</Tabs.Content>
			</Motion.div>
		</Tabs.Root>
		<Motion.div
			initial="leave"
			animate="visible"
			exit="leave"
			variants={{
				visible: {
					transition: {
						duration: 0.8,
						staggerChildren: 0.35,
						opacity: {
							duration: 0.35,
							staggerChildren: 0.35,
						},
					},
				},
				leave: {
					transition: {
						duration: 0.8,
						staggerChildren: 0.35,
						staggerDirection: -1,
						opacity: {
							duration: 0.25,
							staggerChildren: 0.12,
							staggerDirection: -1,
						},
					},
				},
			}}
			class="flex h-full flex-col gap-3">
			<Motion.div variants={date} class={cn('hidden', { 'xl:block': tab === 'overview' })}>
				<DateSelect />
			</Motion.div>
			<Motion.div
				variants={freeFall}
				class={cn('ml-0.5 flex h-full flex-col pb-6', { hidden: tab === 'transactions' })}>
				<span class="-mr-4 flex items-baseline justify-between">
					<div class="flex flex-col items-start">
						<p class="text-base font-medium">Recent Transactions</p>
						<p
							class="text-muted-foreground relative flex flex-row items-center justify-center gap-1 overflow-hidden py-0.5 text-xs">
							<span class="flex-shrink-0">Spent</span>
							<span class="flex items-baseline">
								{#each numberFormat().format($expenseTotal).split('') as digit}
									{#if !Number(digit) && digit !== '0'}
										{digit}
									{:else}
										<AnimatedNumber value={digit} />
									{/if}
								{/each}
							</span>
						</p>
					</div>
					<form
						method="get"
						action="/transactions"
						onformdata={(e) => {
							Array.from(e.formData.entries()).reduce((acc, [k, v]) => {
								!v && e.formData.delete(k);
								return acc;
							});
						}}>
						<input type="hidden" name="processedDate" value={Temporal.PlainDate.from(processedDay).toLocaleString()} />
						<input type="hidden" name="search" value={searchFilter} />
						<Motion.button class="flex flex-row items-center justify-end justify-items-end text-sm" whileHover="hover">
							See all
							<Motion.span
								variants={{
									hover: {
										x: 7,
										transition: {
											repeat: Infinity,
											repeatType: 'mirror',
											duration: 0.65,
											delay: 0.05,
											ease: 'backOut',
										},
									},
								}}>
								<svelte:component this={icons.RightChevronIcon} class="h-4 w-6 text-base" height="auto" inline />
							</Motion.span>
						</Motion.button>
					</form>
				</span>
				<!-- <CategoriesWidget /> -->
				{#if $mostRecentTransactions?.length}
					<div
						style="scrollbar-gutter: stable;"
						class="-mr-2 ml-0.5 overflow-y-auto scroll-smooth max-md:basis-[calc(100dvh_-_32em)] md:basis-[calc(100dvh_-_50em)] xl:basis-[calc(100dvh_-_34em)]">
						{#each $mostRecentTransactions as transaction, indx (transaction.id)}
							<div
								class="dark:divide-opacity-20 relative w-full divide-y-2 divide-stone-200 overflow-hidden dark:divide-stone-600">
								<div class="flex-grow mx-1 flex items-end justify-between overflow-hidden py-3">
									<div>
										<p class="truncate text-base font-medium max-sm:w-[31ch] xl:w-[26ch]">
											{transaction.description}
										</p>
										<p class="text-muted-foreground flex text-xs">
											{intlFormatDistance(transaction.date, processedDay)}
											<span><svelte:component this={icons.DotIcon} height="auto" inline /></span>
											{transaction.tags || 'Uncategorized'}
										</p>
									</div>
									<div>
										<p
											class={cn(
												'mx-2 flex h-full items-center justify-center rounded-full bg-stone-200 py-0.5 px-2 text-xs dark:bg-slate-900',
												{
													'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400':
														transaction.type === 'income',
													'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300': transaction.type === 'expense',
												}
											)}>
											{numberFormat().format(transaction.amount)}
										</p>
										<p class="text-muted-foreground mx-2 mt-0.5 flex items-center justify-end px-2 text-xs">
											{indx + 1}/{$mostRecentTransactions.length}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Motion.div>
		</Motion.div>
		<div class={cn('hidden justify-end gap-2 pb-2', { 'max-md:flex': tab === 'overview' })}>
			{#each subPages as [label, [subpage, nav]] (nav)}
				<Drawer.Root
					shouldScaleBackground
					open={$page.state.subpage && current.pathname.split('/').pop() === nav}
					onClose={() => history.back()}>
					<Drawer.Trigger asChild let:builder>
						<Button builders={[builder]} href={base.concat(nav)} onclick={handleSubpageChange}>
							{label}
						</Button>
					</Drawer.Trigger>
					<Drawer.Content>
						<svelte:component this={subpage} />
					</Drawer.Content>
				</Drawer.Root>
			{/each}
		</div>
	</div>
</AnimatePresence>
