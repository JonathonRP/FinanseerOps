<script lang="ts">
	import { BehaviorSubject } from 'rxjs';
	import { createEventDispatcher, onMount, setContext } from 'svelte';
	import { type SubmitFunction, enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import { writable } from 'svelte/store';

	let form: HTMLFormElement;

	const values = writable({} as Record<string, undefined | string | number | boolean | string[]>);
	const formSubmitting = new BehaviorSubject(false);
	const formValidity = new BehaviorSubject(false);

	export let reset = false;

	export let action: string;

	export let validate = (_values: typeof $values) =>
		Object.keys(_values ?? {}).reduce((res, k) => ({ ...res, [k]: '' }), {}) as Record<string, string>;

	const handleValidation = (onlyField: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate($values);

		if (onlyField) {
			onlyField.setCustomValidity(errors[onlyField.name] ?? '');
		}

		Array.from(form.elements)
			.map((element) => element as HTMLInputElement)
			.reduce((error, input) => {
				input.checkValidity();
				input.setCustomValidity(errors[input.name] ?? '');
				return { ...error, ...{ [input.name]: input.validationMessage } };
			}, {});

		formValidity.next(form.checkValidity());
		return $formValidity;
	};

	const dispatch = createEventDispatcher();

	const submit: SubmitFunction = ({ data }) => {
		formSubmitting.next(true);
		dispatch('submit', { data });

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
			handleValidation();
			formSubmitting.next(false);
		};
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
		handleValidation();
	};

	const handleBlur = ({
		currentTarget,
	}: FocusEvent & {
		currentTarget: EventTarget & HTMLInputElement;
	}) => {
		const { name, type, checked, value } = currentTarget;
		let nextValue: string | number | boolean | undefined | string[] = value;
		if (type === 'range' || type === 'number') {
			nextValue = nextValue === '' ? undefined : +nextValue;
		} else if (type === 'select-multiple') {
			nextValue = new Array<HTMLInputElement>().map.call(
				currentTarget.querySelectorAll(':checked'),
				(option) => option.value
			) as string[];
		} else if (type === 'checkbox') {
			nextValue = checked;
		}
		values.update((_v) => ({ ..._v, [name]: nextValue }));
		handleValidation();
	};

	setContext('form', { valid: formValidity, submitting: formSubmitting });

	onMount(() => {
		$values = Array.from(form.elements)
			.map((field) => field as HTMLInputElement)
			.reduce(
				(res, { name, valueAsNumber, value, checked, type }) => ({
					...res,
					[name]:
						((type === 'number' || type === 'range') && valueAsNumber) ||
						(type !== 'checkbox' && type !== 'number' && value) ||
						checked,
				}),
				<typeof $values>{}
			);

		handleValidation();
	});
</script>

<form {action} {...$$restProps} novalidate bind:this={form} use:enhance={submit}>
	<slot submitting={$formSubmitting} {handleInput} {handleBlur} />
</form>
