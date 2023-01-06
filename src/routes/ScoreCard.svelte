<script lang="ts">
    import type { Color } from '$lib/utils';
    import DashboardWidget from "./DashboardWidget.svelte";
    import { addCollection } from 'iconify-icon';
    import down from '@iconify-icons/fa6-solid/arrow-trend-down';
    import up from '@iconify-icons/fa6-solid/arrow-trend-up';

    export let label:string;
    export let score:number;
    export let comparison: Partial<{ score: number, positiveColor?: Color, negativeColor?: Color, swap: boolean }> | undefined = undefined;

    const numberFormat: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', notation: 'compact' };

    addCollection({
        prefix: 'fa6-solid',
        icons: {
            'up': up,
            'down': down
        }
    })
</script>

<DashboardWidget>
    <header>
        {label}
    </header>
    <h1>{score.toLocaleString('en-US', numberFormat)}</h1>

    {#if comparison && comparison.score && comparison.score > 0}
        {@const {compare, positiveColor, negativeColor} = {
            compare: score < comparison.score,
            positiveColor: comparison.swap || false ? comparison.negativeColor || 'red' : comparison.positiveColor || 'green',
            negativeColor: comparison.swap || false ? comparison.positiveColor || 'green' : comparison.negativeColor || 'red'
        }}
        <p>{comparison.score.toLocaleString('en-US', numberFormat)} 
            <span>
                <iconify-icon icon={compare ? down : up} style='color: { compare ? negativeColor : positiveColor }' />
            </span>
        </p>
    {/if}
</DashboardWidget>

<style>
    p {
        display: flex;
        margin: .3rem 1rem 0;
        gap: .3rem;
    }
    span {
        display: flex;
        align-items: center;
    }
</style>