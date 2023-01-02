<script lang="ts">
    import { page } from '$app/stores';
    import { dev } from '$app/environment';
</script>

<svelte:head>
    <meta charset="utf-8">
    <title>{$page.error?.message}</title>
</svelte:head>
<body>
    <div class="error">
        <span class="status">{$page.status}</span>
        <div class="message">
            <h1>
                <b>Oops!</b>
            </h1>
            <div>
                <em>{$page.error?.message}</em>
                {#if (dev)}
                    <pre>{JSON.stringify($page.error, null, 2)}</pre>
                {/if}
            </div>
        </div>
    </div>
</body>
<style>
    body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .error {
        display: flex;
        align-items: center;
        max-width: 32rem;
        margin: 0 1rem;
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
        /* display: flex; */
        /* align-items: center; */
    }

    .message h1 {
        font-weight: 400;
        font-size: 1em;
        margin: 0;
    }

    .message div {
        display: block;
    }
</style>