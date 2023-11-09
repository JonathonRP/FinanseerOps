import { createEventDispatcher } from 'svelte';
import toast from 'svelte-french-toast';
import { writable, get as $ } from 'svelte/store';
import { enhance } from '$app/forms';

type FormValues = Record<string, undefined | string | number | boolean | string[]>;

export default (
	node: HTMLFormElement,
	{
		reset = false,
		action,
		validate = (_values: FormValues) =>
			Object.keys(_values ?? {}).reduce((res, k) => ({ ...res, [k]: '' }), {}) as Record<string, string>,
	}: {
		reset: boolean;
		action: string;
		validate: (_values: FormValues) => Record<string, string>;
	}
) => {
	const form = node;

	const values = writable({} as FormValues);
	let formSubmitting = false;
	let formValidity = false;

	form.setAttribute('action', action);

	const handleValidation = (onlyField: (EventTarget & HTMLInputElement) | undefined = undefined) => {
		const errors = validate($(values));

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

		formValidity = form.checkValidity();
		return formValidity;
	};

	const dispatch = createEventDispatcher();

	const handleInput = ({ currentTarget }: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
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

	values.set(
		Array.from(form.elements)
			.map((field) => field as HTMLInputElement)
			.reduce(
				(res, { name, valueAsNumber, value, checked, type }) => ({
					...res,
					[name]:
						((type === 'number' || type === 'range') && valueAsNumber) ||
						(type !== 'checkbox' && type !== 'number' && value) ||
						checked,
				}),
				<FormValues>{}
			)
	);

	handleValidation();
	enhance(form, ({ formData }) => {
		formSubmitting = true;
		dispatch('submit', { data: formData });

		return async ({ result, update }) => {
			switch (result.type) {
				case 'success':
					await update({ reset });
					dispatch('success', { data: formData });
					break;
				case 'failure': {
					if (result.data && result.data?.errors) {
						const [firstError] = Object.keys(result.data.errors);
						toast.error(result.data.errors[firstError][0]);
					}
					break;
				}
				case 'error':
					toast.error(result.error.message);
					break;
				default:
					await update({ reset });
			}
			handleValidation();
			formSubmitting = false;
		};
	});

	return {
		update(params) {},
		destroy() {},
	};
};
