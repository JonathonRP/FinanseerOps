<script>
	import "../app.scss";
    import './styles.css';
    import Header from './Header.svelte';
    import { page } from '$app/stores';

    const routes = ['basics', 'overview', 'categories']
</script>

<div class="app">
	<Header/>

	<aside aria-label="secondary navigation">
		<nav>
			<select>
				{#each routes.slice(0,1) as route, i}
					<option selected={$page.url.pathname === '/' ? i === 0 : $page.url.pathname === '/'+route} value={route}>{route}</option>
				{/each}
			</select>
			<ul>
				{#each routes.slice(0,1) as route, i}
					{@const current = $page.url.pathname === '/' ? i === 0 : $page.url.pathname === '/'+route}
					<li><a aria-current={current ? 'location' : undefined} href={i === 0 ? '/' : '/'+route}>{route}</a></li>
				{/each}
			</ul>
		</nav>
	</aside>

	<main>
		<slot></slot>
	</main>

	<footer>
		
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	nav > ul {
		display: none;
	}

	nav select option:is(:checked, :focus, :active) {
		background-color: var(--primary-hover);
	}

	aside {
		flex: 0 1;
		display: flex;
		flex-direction: column;
		padding: 2rem 2rem 0 2rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	main {
		flex: 1;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	/* footer a {
		font-weight: bold;
	} */

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}

	@media (min-width: 750px) {
		.app {
			flex-direction: row;
			flex-wrap: wrap;
			align-content: flex-start;
		}

		nav > select {
			display: none;
		}

		nav > ul {
			display: block;
		}

		nav :where(a, [role=link]):is([aria-current], :hover) {
			background-color: var(--primary-focus);
			text-decoration: none;
		}

		aside {
			padding: 3rem 0 0 3rem;
		}
	}
</style>
