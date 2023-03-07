<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { createEventDispatcher, setContext } from 'svelte';
	import { type SubmitFunction, enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import { writable } from 'svelte/store';

	const values = writable({} as Record<string, any>);
	export let reset = false;

	export let action: string;

	let form: HTMLFormElement;

	const formSubmitting = new BehaviorSubject(false);
	const formValid = new BehaviorSubject(false);

	const dispatch = createEventDispatcher();

	const submit: SubmitFunction = ({ data }) => {
		formSubmitting.next(true);

		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update({ reset });
					dispatch('success', { data });
					break;
				case 'failure':
					toast.error(result.data?.errors);
					break;
				case 'error':
					toast.error(result.error.message);
					break;
				default:
					await update({ reset });
			}
			formSubmitting.next(false);
		};
	};

	const validate = (_values = $values) => ({} as Record<string, string>);

	const handleValidation = (field: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate();

		if (field) {
			field.setCustomValidity(errors[field.name] ?? '');
			field.reportValidity();
		}

		Array.from(form.elements).forEach((e) => {
			const input = e as HTMLInputElement;
			input.setCustomValidity(errors[input.name] ?? '');
			input.reportValidity();
		});
		formValid.next(form.checkValidity());
	};

	const handleInput = ({ currentTarget }: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const { name, type, checked, value } = currentTarget;
		let nextValue = value as any;
		if (type === 'range' || type === 'number') {
			nextValue = nextValue === '' ? undefined : +nextValue;
		} else if (type === 'select-multiple') {
			nextValue = new Array<any>().map.call(currentTarget.querySelectorAll(':checked'), (option) => option.value);
		} else if (type === 'checkbox') {
			nextValue = checked;
		}
		values.update((_v) => ({ ..._v, [name]: nextValue }));
	};

	const handleBlur = (
		e: FocusEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		const $this = e.currentTarget;
		handleValidation($this);
	};

	setContext('form', { valid: formValid, submitting: formSubmitting });
	setContext('fields', { handleInput, handleBlur, validate });
</script>

<form {action} {...$$restProps} novalidate bind:this={form} use:enhance={submit}>
	<slot submitting={$formSubmitting} />
</form>
