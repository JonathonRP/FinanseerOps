
<article>
    <slot>

    </slot>
</article>

<style>
    article {
        padding-bottom: 1rem;
    }
    article > :global(:where(header, footer)) {
        padding: 1rem;
        margin-bottom: 1rem;
        background-color: transparent;
    }
    article > :global(:where(h1, p)) {
        margin-bottom: 0;
    }
</style>