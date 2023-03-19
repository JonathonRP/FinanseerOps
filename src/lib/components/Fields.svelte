<script lang="ts">
	import { getContext, setContext } from 'svelte';

	const { handleInput, handleBlur } = getContext<{
		handleInput: ({ currentTarget }: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
		handleBlur: (
			e: FocusEvent & {
				currentTarget: EventTarget & HTMLInputElement;
			}
		) => void;
	}>('fields');

	setContext('fields', { handleInput, handleBlur });
</script>

<slot {handleInput} {handleBlur} />
