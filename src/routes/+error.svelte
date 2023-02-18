<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
</script>

<svelte:head>
	<title>{$page.error?.message}</title>
</svelte:head>

<div class="error">
	<span class="status">{$page.status}</span>
	<div class="message">
		<h1>
			<b>Oops!</b>
		</h1>
		<div>
			<em>{$page.error?.message}</em>
			{#if dev}
				<pre>{JSON.stringify($page.error, null, 2)}</pre>
			{/if}
		</div>
	</div>
</div>

<style>
	.error {
		display: flex;
		align-items: center;
		max-width: 32rem;
		margin: 0 1rem;
		padding: 3rem 0 3rem 3rem;
	}

	.status {
		font-weight: 200;
		font-size: 3rem;
		line-height: 1;
		position: relative;
		top: -0.05rem;
	}

	.message {
		border-left: 1px solid #ccc;
		padding: 0 0 0 1rem;
		margin: 0 0 0 1rem;
		min-height: 2.5rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	.message h1 {
		text-align: start;
		width: 100%;
		font-weight: 400;
		font-size: 1em;
		margin: 0;
	}

	.message div {
		display: block;
	}
</style>
