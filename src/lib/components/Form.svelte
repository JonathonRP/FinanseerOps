<svelte:options runes={true} />

<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { BehaviorSubject } from 'rxjs';
	import { createEventDispatcher, setContext, type Snippet } from 'svelte';
	import toast from 'svelte-french-toast';
	import { writable } from 'svelte/store';
	import { applyAction, enhance } from '$app/forms';

	let {
		form,
		method,
		action,
		reset = false,
		values: initialValues,
		validate = (_values) =>
			Object.keys(_values ?? {}).reduce((res, k) => ({ ...res, [k]: '' }), {}) as Record<string, string>,
		...restProps
	}: {
		method: string;
		action: string;
		form?: HTMLFormElement;
		reset?: boolean;
		values?: Values;
		validate?: (_values: Values) => Record<string, string>;
		children: Snippet;
		class: string;
	} = $props();

	type Values = Record<string, undefined | null | string | number | boolean | string[]>;

	const values = writable(
		initialValues ??
			Array.from(form?.elements ?? [])
				.map((field) => field as HTMLInputElement)
				.reduce(
					(res, { name, valueAsNumber, value, checked, type }) => ({
						...res,
						[name]:
							((type === 'number' || type === 'range') && valueAsNumber) ||
							(type !== 'checkbox' && type !== 'number' && value) ||
							checked,
					}),
					<Values>{}
				)
	);
	const formSubmitting = new BehaviorSubject(false);
	const formValidity = new BehaviorSubject(false);

	const handleValidation = (onlyField: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate($values);

		if (onlyField) {
			onlyField.setCustomValidity(errors[onlyField.name] ?? '');
		}

		Array.from(form?.elements ?? [])
			.map((element) => element as HTMLInputElement)
			.reduce((error, input) => {
				input.checkValidity();
				input.setCustomValidity(errors[input.name] ?? '');
				return { ...error, ...{ [input.name]: input.validationMessage } };
			}, {});

		formValidity.next(form?.checkValidity() ?? false);
		return $formValidity;
	};

	const dispatch = createEventDispatcher();

	const submit: SubmitFunction = ({ formData }) => {
		formSubmitting.next(true);
		dispatch('submit', { data: formData });

		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update({ reset });
					dispatch('success', { data: formData });
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
			handleValidation();
			formSubmitting.next(false);
			await applyAction(result);
		};
	};

	const handleInput = ({
		currentTarget,
	}: Event & { currentTarget: EventTarget & (HTMLInputElement | HTMLButtonElement) }) => {
		const { name, type, value } = currentTarget;
		let nextValue: string | number | boolean | undefined | string[] = value;
		if (type === 'range' || type === 'number') {
			nextValue = nextValue === '' ? undefined : +nextValue;
		} else if (type === 'select-multiple') {
			nextValue = new Array<HTMLInputElement>().map.call(
				currentTarget.querySelectorAll(':checked'),
				(option) => option.value
			) as string[];
		} else if (type === 'checkbox') {
			nextValue = (currentTarget as HTMLInputElement).checked;
		}
		values.update((_v) => ({ ..._v, [name]: nextValue }));
		handleValidation();
	};

	const handleBlurOrClick = (
		node: FocusEvent & {
			currentTarget: EventTarget & (HTMLInputElement | HTMLButtonElement);
		}
	) => {
		handleInput(node);
	};

	// const protoFormData = new FormData(form);
	// const formData = $derived(
	// 	Object.fromEntries(
	// 		Array.from(protoFormData.entries()).map(([name, value]) => {
	// 			const allValues = protoFormData.getAll(name);
	// 			return [name, allValues.length > 1 ? value : allValues];
	// 		})
	// 	)
	// );

	const formData = $values;

	setContext('form', { valid: formValidity, submitting: formSubmitting });

	// $effect(() => {
	// 	handleValidation();
	// });
</script>

{#if method.includes('post')}
	<form method="post" {action} {...restProps} novalidate bind:this={form} use:enhance={submit}>
		<slot valid={$formValidity} submitting={$formSubmitting} {formData} {handleInput} {handleBlurOrClick} />
	</form>
{:else}
	<form {method} {action} {...restProps} novalidate bind:this={form}>
		<slot valid={$formValidity} submitting={$formSubmitting} {formData} {handleInput} {handleBlurOrClick} />
	</form>
{/if}
