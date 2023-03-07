<script lang="ts">
	import { getContext } from 'svelte';

	const {
		handleInput,
		handleBlur,
		validate: validation,
	} = getContext<{
		handleInput: ({ currentTarget }: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
		handleBlur: (
			e: FocusEvent & {
				currentTarget: EventTarget & HTMLInputElement;
			}
		) => void;
		validate: (_values: Record<string, any>) => Record<string, string>;
	}>('fields');

	export const validate = validation;
</script>

<slot {handleInput} {handleBlur} />
