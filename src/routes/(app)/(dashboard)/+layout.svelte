<svelte:options runes={true} />

<script lang="ts">
	import { type Snippet } from 'svelte';
	import { formatDistanceToNow, isBefore, isSameDay, isSameMonth, startOfToday } from 'date-fns';
	import { startWith, from, map } from 'rxjs';
	import { cn, numberFormat } from '$lib/utils';
	import { AnimatePresence, type Variants } from 'svelte-motion';
	import { Motion } from '$lib/components';
	import { icons } from '$/icons';
	import { Tabs } from '$lib/components/ui/tabs';
	import { ease } from '$lib/animations';
	import AnimatedNumber from '$/lib/components/AnimatedNumber.svelte';
	import { base } from '$app/paths';
	import DateSelect from './DateSelect.svelte';
	import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const { data, children }: { data: import('./$types').LayoutData; children: Snippet } = $props();
	const { current, processedDate, searchFilter, transactions } = $derived(data);

	const tab = $derived(current.pathname.split('/').pop() ?? 'overview');

	const processedDay = $derived((processedDate && new Date(processedDate)) || startOfToday());

	const mostRecentTransactions = $derived(
		from(transactions).pipe(
			map((result) =>
				result
					.filter(
						({ date }) =>
							isSameMonth(date, processedDay) && (isBefore(date, processedDay) || isSameDay(date, processedDay))
					)
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
		hidden: (dir) => ({
			position: 'fixed',
			x: `${-100 * dir}%`,
			opacity: 0,
			zIndex: 0,
		}),
		visible: {
			position: 'relative',
			x: '0%',
			opacity: 1,
			zIndex: 1,
		},
		leave: (dir) => ({
			position: 'fixed',
			x: `${100 * dir}%`,
			opacity: 0,
			zIndex: 0,
		}),
	};

	const freeFall: Variants = {
		visible: {
			display: 'flex',
			y: '0%',
			opacity: 1,
			transition: {
				ease,
			},
		},
		leave: {
			y: `100%`,
			opacity: 0,
			transition: {
				ease,
			},
		},
	};

	const date: Variants = $derived({
		visible: {
			opacity: 1,
			transition: {
				opacity: {
					duration: 0.8,
					ease: 'easeInOut',
					delay: tab === 'overview' ? 0 : 0.8,
				},
			},
		},
		leave: {
			opacity: 0,
			transition: { opacity: { duration: 0.2, ease: 'easeInOut' } },
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
</script>

<AnimatePresence initial={false} show={loading || mounting}>
	<Motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		class="fixed inset-0 z-20 touch-none select-none backdrop-blur-[0.4rem]" />
</AnimatePresence>
<AnimatePresence initial={!mounting} show={!loading || !mounting} custom={direction}>
	<div class="flex h-full w-full flex-col justify-between gap-4 md:px-4 md:py-2 lg:px-8 xl:flex-row">
		<Tabs.Root
			value={tab}
			activateOnFocus={false}
			onValueChange={async (value) => {
				if (browser) {
					let location = `${base}`;
					if (value === 'transactions') location = location.concat(current.pathname.split('/').pop() ?? '');

					await goto(`${location}/${value}`);
				}
			}}
			class="xl:flex-grow xl:basis-[56rem]">
			<!-- basis-[28.125rem] -->
			<Tabs.List class="grid w-max grid-cols-2 lg:-ml-6">
				<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
				<Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="overview">
				<Motion.section
					initial="hidden"
					animate={!loading && tab === 'overview' ? 'visible' : 'leave'}
					variants={horizontalSlide}
					transition={{ duration: 0.8, staggerChildren: 0.35, ease }}
					custom={-1}
					class="mx-auto h-full w-full @container sm:mt-0 md:mx-0 md:pr-4">
					{@render children()}
				</Motion.section>
			</Tabs.Content>
			<Tabs.Content value="transactions">
				<Motion.section
					initial="hidden"
					animate={!loading && tab === 'transactions' ? 'visible' : 'leave'}
					variants={horizontalSlide}
					transition={{ duration: 0.8, staggerChildren: 0.35, ease }}
					custom={1}
					class="mx-auto h-full w-full @container sm:mt-0 md:mx-0 md:pr-4 xl:max-w-[calc(100dvw-30em)]">
					{@render children()}
				</Motion.section>
			</Tabs.Content>
		</Tabs.Root>
		<div class="flex-col gap-3 xl:flex">
			<Motion.div animate={!loading ? 'visible' : 'leave'} exit="leave" variants={date} class="hidden xl:flex">
				<DateSelect />
			</Motion.div>
			<Motion.div
				initial="leave"
				animate={tab === 'overview' ? 'visible' : 'leave'}
				exit="leave"
				variants={freeFall}
				class="ml-0.5 hidden flex-col">
				<span class="-mr-4 flex items-baseline justify-between">
					<div class="flex flex-col items-start">
						<p class="text-base font-medium">Recent Transactions</p>
						<p
							class="relative flex flex-row items-center justify-center gap-1 overflow-hidden py-0.5 text-xs text-muted-foreground">
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
						action="overview/transactions"
						on:formdata={(e) => {
							Array.from(e.formData.entries()).forEach(([k, v]) => !v && e.formData.delete(k));
						}}>
						<input type="hidden" name="processedDate" value={processedDate} />
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
				{#if $mostRecentTransactions?.length}
					<div
						class="-mr-2 ml-0.5 overflow-y-scroll scroll-smooth max-md:mb-8 max-md:basis-[calc(100dvh_-_34em)] md:basis-[calc(100dvh_-_36em)] xl:basis-[calc(100dvh_-_34em)]">
						{#each $mostRecentTransactions as transaction, indx (transaction.id)}
							<div
								class="relative flex w-full divide-y-2 divide-stone-200 overflow-hidden dark:divide-stone-600 dark:divide-opacity-20">
								<div class="mx-1 flex flex-grow items-end justify-between overflow-hidden py-3">
									<div>
										<p class="truncate text-base font-medium max-sm:w-[31ch] xl:w-[26ch]">
											{transaction.description}
										</p>
										<p class="flex text-xs text-muted-foreground">
											{formatDistanceToNow(transaction.date)} ago
											<span><svelte:component this={icons.DotIcon} height="auto" inline /></span>
											{transaction.tags || 'Uncategorized'}
										</p>
									</div>
									<div>
										<p
											class={cn(
												'mx-2 flex h-full items-center justify-center rounded-full bg-stone-200 px-2 py-0.5 text-xs dark:bg-slate-900',
												{
													'bg-green-100 text-green-600 dark:bg-green-900 dark:text-emerald-400':
														transaction.type === 'income',
													'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300': transaction.type === 'expense',
												}
											)}>
											{numberFormat().format(transaction.amount)}
										</p>
										<p class="mx-2 mt-0.5 flex items-center justify-end px-2 text-xs text-muted-foreground">
											{indx + 1}/{$mostRecentTransactions.length}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Motion.div>
		</div>
	</div>
</AnimatePresence>
