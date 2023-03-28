<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { createEventDispatcher, onMount, setContext } from 'svelte';
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
	const formValidity = new BehaviorSubject(false);

	const dispatch = createEventDispatcher();

	const submit: SubmitFunction = ({ data }) => {
		formSubmitting.next(true);

		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update({ reset });
					dispatch('success', { data });
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

		formValidity.next(form.checkValidity());
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
		handleValidation(currentTarget);
	};

	const handleBlur = ({
		currentTarget,
	}: FocusEvent & {
		currentTarget: EventTarget & HTMLInputElement;
	}) => {
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
		handleValidation(currentTarget);
	};

	setContext('form', { valid: formValidity, submitting: formSubmitting });
	setContext('fields', { handleInput, handleBlur });

	onMount(() => {
		handleValidation();
	});
</script>

<form {action} {...$$restProps} novalidate bind:this={form} on:submit use:enhance={submit}>
	<slot submitting={$formSubmitting} />
</form>
