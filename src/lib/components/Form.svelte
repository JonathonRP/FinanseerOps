<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { createEventDispatcher, setContext } from 'svelte';
	import { type SubmitFunction, enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import { writable } from 'svelte/store';

	let form: HTMLFormElement;

	const values = writable({} as Record<string, string | number>);
	export let reset = false;

	export let action: string;

	// FIXME - $values not supplying values
	export let validate = (
		_values = Array.from(form.elements)
			.map((field) => field as HTMLInputElement)
			.reduce(
				(res, input) => ({
					...res,
					[input.name]: input.valueAsNumber || input.value,
				}),
				{} as Record<string, string | number>
			)
	) => Object.keys(_values ?? {}).reduce((res, k) => ({ ...res, [k]: '' }), {}) as Record<string, string>;

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

	const handleValidation = (field: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate();

		if (field) {
			field.setCustomValidity(errors[field.name] ?? '');
		}

		const fields = Array.from(form.elements).map((element) => element as HTMLInputElement);

		// TODO - determine how to express using Array.map()
		fields.forEach((input) => input.setCustomValidity(errors[input.name]));

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
	setContext('fields', { handleInput, handleBlur });
</script>

<form {action} {...$$restProps} novalidate bind:this={form} use:enhance={submit}>
	<slot submitting={$formSubmitting} />
</form>
