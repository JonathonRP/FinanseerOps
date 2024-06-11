<svelte:options runes={true} />

<script lang="ts" generics="T extends Record<string, unknown>">
	import { invalidateAll as invalidateAllRoutes, invalidate as invalidateRoute } from '$app/navigation';

	import type { SubmitFunction } from '@sveltejs/kit';
	import { BehaviorSubject } from 'rxjs';
	import { setContext, type Snippet } from 'svelte';
	import toast from 'svelte-french-toast';
	import { writable } from 'svelte/store';
	import { applyAction, enhance } from '$app/forms';

	let {
		form = $bindable(),
		method,
		action,
		reset = false,
		values: initialValues,
		validate = (_values, errors) =>
			Object.keys(_values ?? {}).reduce((res, k) => ({ ...res, [k]: '' }), {} as typeof errors),
		onsubmitting,
		onsucceeded,
		children,
		...restProps
	}: {
		form?: HTMLFormElement;
		method: 'post';
		action: string;
		reset?: boolean;
		values?: T;
		validate?: (_values: typeof initialValues, errors: Errors<T>) => typeof errors;
		onsubmitting?: (data: FormData) => void;
		onsucceeded?: (
			data: FormData,
			invalidate: typeof invalidateRoute,
			invalidateAll: typeof invalidateAllRoutes
		) => void | Promise<void>;
		children: Snippet<
			[
				{
					valid: typeof $formValidity;
					submitting: typeof $formSubmitting;
					formData: typeof initialValues;
					handleInput: typeof handleInput;
					handleBlurOrClick: typeof handleBlurOrClick;
				},
			]
		>;
		class?: string;
	} = $props();

	// work on this type...
	// type Values = Record<string, undefined | null | string | number | boolean | string[]>;

	// const elements = <const>form.elements.map((field) => field as HTMLInputElement);
	// type elementName = (typeof elements)[number]['value'];
	// type values<T extends (typeof elements)[number]['type']> = T extends 'number'
	// 	? { [(typeof elements[number]).name]: (typeof elements)[number]['valueAsNumber'] }
	// 	: {};

	// type Values<T extends Record<string, unknown>> = T extends Record<infer K, string> ? { [v in K]: string } : T;
	type Errors<T extends Record<string, unknown>> = T extends Record<infer K, unknown> ? { [v in K]: string } : T;

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
					{} as T
				)
	);
	const formSubmitting = new BehaviorSubject(false);
	const formValidity = new BehaviorSubject(false);

	const handleValidation = (onlyField: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate($values, {} as Errors<T>);

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

	const submit: SubmitFunction = ({ formData }) => {
		formSubmitting.next(true);
		onsubmitting?.(formData);

		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update({ reset });
					await onsucceeded?.(formData, invalidateRoute, invalidateAllRoutes);
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
			await applyAction(result);
			handleValidation();
			formSubmitting.next(false);
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

	const formData = $derived($values);

	setContext('form', { valid: formValidity, submitting: formSubmitting });

	$effect(() => {
		handleValidation();
	});
</script>

{#if method.includes('post')}
	<form method="post" {action} {...restProps} novalidate bind:this={form} use:enhance={submit}>
		{@render children({
			valid: $formValidity,
			submitting: $formSubmitting,
			formData,
			handleInput,
			handleBlurOrClick,
		})}
	</form>
{/if}
