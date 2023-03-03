<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { enhance, type SubmitFunction } from '$app/forms';
	import toast from 'svelte-french-toast';
	import Button from '$lib/Components/Button.svelte';
	import newUser from '@iconify-icons/tabler/user-plus';

	export let action: string;

	const formSubmitting = new BehaviorSubject(false);
	const disableSubmitting = new BehaviorSubject(true);

	const submit: SubmitFunction = ({ data }) => {
		formSubmitting.next(true);

		return async ({ result, update }) => {
			if (result) {
				switch (result.type) {
					case 'success':
						await update();
						toast.success(`Successfully invited ${data.get('email')}`);
						break;
					case 'error':
						toast.error(result.error.message);
						break;
					default:
						await update();
				}
				formSubmitting.next(false);
			}
		};
	};
</script>

<form
	{action}
	method="post"
	class="flex w-full items-center border-b py-2 transition-colors focus-within:border-primary-500 hover:border-primary-400"
	use:enhance={submit}>
	<iconify-icon icon={newUser} inline class="mr-2 flex h-6 w-12 items-center" />
	<input
		id="email"
		name="email"
		class="mr-3 w-full appearance-none border-none bg-transparent py-1 px-2 leading-tight text-gray-600 focus:outline-none focus:ring-0 dark:text-neutral-309"
		type="text"
		inputmode="email"
		placeholder="email address"
		required
		aria-label="email"
		disabled={$formSubmitting}
		on:change={(event) => {
			disableSubmitting.next(event.currentTarget.value.length < 1);
		}} />
	<Button type="submit" loading={$formSubmitting} disable={$disableSubmitting} inline>Invite</Button>
</form>
