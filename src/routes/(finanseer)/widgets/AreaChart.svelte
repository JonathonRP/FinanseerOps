<script lang="ts">
	import * as d3 from 'd3';

	export let data: { date: Date; expense: number }[];

	// Settings
	export let width = 148;
	export let height: number = undefined || width;
</script>

<svg class="bg-transparent text-gray-900 dark:text-gray-100" viewBox={`0 0 ${width} ${height / 2}`}>
	<g transform={`translate(${width / 2},${height / 2})`}>
		<text>Area Chart</text>
	</g>
</svg>
