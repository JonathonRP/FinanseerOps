<script lang="ts">
  import type {Color} from '$lib/utils';
  import down from '@iconify-icons/fa6-solid/arrow-trend-down';
  import up from '@iconify-icons/fa6-solid/arrow-trend-up';
  import {addCollection} from 'iconify-icon';
  import {onMount} from 'svelte';
  import {spring, tweened} from 'svelte/motion';
  import {fade} from 'svelte/transition';
  import DashboardWidget from './DashboardWidget.svelte';

  addCollection({
    prefix: 'fa6-solid',
    icons: {
      up,
      down,
    },
  });

  export let delay: number | undefined = undefined;
  export let label: string;
  export let score: number | undefined;
  export let comparison:
    | Partial<{score: number; positiveColor?: Color; negativeColor?: Color; swap: boolean}>
    | undefined = undefined;

  const numberFormat: Intl.NumberFormatOptions = {style: 'currency', currency: 'USD', notation: 'compact'};

  let locale: string;
  onMount(() => {
    locale = navigator.languages[0] || navigator.language;
  });

  const score$ = tweened(score, {duration: 300});
  const comparisonScore$ = spring(comparison?.score, {damping: 0.12, stiffness: 0.12});

  $: score && score$.set(score);
  $: comparison?.score && comparisonScore$.set(comparison.score);
</script>

<DashboardWidget>
  <div class="text-base text-gray-400 dark:text-gray-300">
    {label}
  </div>
  {#if !score}
    <div
      class="flex w-[164.57px] pt-1 h-full animate-pulse flex-row items-center justify-center space-x-5 pr-11"
      class:animation-delay-150={delay === 1}
      class:animation-delay-300={delay === 2}
    >
      <div
        style="animation-fill-mode: backward"
        class="h-8 w-44 animate-gradient-x rounded-md bg-gradient-to-r from-gray-300 via-white to-gray-50"
      />
    </div>
  {:else}
    <div class="flex w-[164.57px] items-center pt-1">
      <div transition:fade={{duration: 300}} class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {$score$.toLocaleString(locale, numberFormat)}
      </div>

      {#if comparison && comparison.score && comparison.score > 0}
        {@const {compare, positiveColor, negativeColor} = {
          compare: $score$ < comparison.score,
          positiveColor:
            comparison.swap || false ? comparison.negativeColor || 'red' : comparison.positiveColor || 'green',
          negativeColor:
            comparison.swap || false ? comparison.positiveColor || 'green' : comparison.negativeColor || 'red',
        }}
        {@const {color} = {color: compare ? negativeColor : positiveColor}}
        <span
          class="mx-2 flex items-center rounded-full px-2 py-0.5 text-sm"
          class:bg-green-100={color === 'green'}
          class:text-green-600={color === 'green'}
          class:dark:bg-green-900={color === 'green'}
          class:dark:text-emerald-400={color === 'green'}
          class:bg-red-100={color === 'red'}
          class:text-red-600={color === 'red'}
          class:dark:bg-red-900={color === 'red'}
          class:dark:text-red-300={color === 'red'}
          transition:fade={{duration: 300}}
        >
          <span>
            {$comparisonScore$.toLocaleString(locale, numberFormat)}
          </span>
          <iconify-icon inline icon={compare ? down : up} />
        </span>
      {/if}
    </div>
  {/if}
</DashboardWidget>
