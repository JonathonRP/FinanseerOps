<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { session } from '$lib/stores/session';
	import useBauhaus from '$lib/stores/useBauhaus';
	import toast from 'svelte-french-toast';
	import Button from '$lib/components/button.svelte';

	export let action: string;

	const formSubmitting = new BehaviorSubject(false);
	const disableSubmitting = new BehaviorSubject(true);

	const { user } = $session;

	const submit: SubmitFunction = () => {
		formSubmitting.next(true);

		return async ({ result, update }) => {
			if (result) {
				switch (result.type) {
					case 'success':
						await update();
						toast.success('Successfully updated user.');
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

<form {action} method="post" class="w-full space-y-4" use:enhance={submit}>
	<input
		class="flex w-full appearance-none justify-center rounded-full border-none bg-transparent p-1 text-center transition-all hover:ring-1 hover:ring-gray-300 focus:outline-none  focus:ring-2 focus:ring-gray-300"
		id="name"
		name="name"
		value={user?.name}
		disabled={$formSubmitting}
		on:change={(event) => {
			disableSubmitting.next(event.currentTarget.value.length < 1 || event.currentTarget.value !== user?.name);
		}} />
	<label class="mb-2 flex text-sm font-bold" for="bauhaus" aria-disabled={$formSubmitting}>
		<input
			type="checkbox"
			id="bauhaus"
			name="useBauhaus"
			class="form-checkbox mr-2 rounded-full leading-tight text-primary-500 focus:ring-primary-500 focus:ring-offset-neutral-808"
			checked={$useBauhaus}
			disabled={$formSubmitting}
			on:change={(event) => {
				disableSubmitting.next(event.currentTarget.checked !== $useBauhaus);
			}} />
		Use Buasuah
	</label>
	<Button type="submit" loading={$formSubmitting} disable={$disableSubmitting}>Save Settings</Button>
</form>
