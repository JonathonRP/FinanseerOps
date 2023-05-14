<script lang="ts">
	import * as d3 from 'd3';

	export let data: number[]; // date: Date; expense: number
	console.log(data);

	// Settings
	export let width = 148;
	export let height: number = undefined || width;

	// Create scales
	const yScale = d3
		.scaleLinear()
		.range([height, 0])
		.domain([0, d3.max(data, (dataPoint: number[]) => dataPoint[1])]);
	const xScale = d3
		.scaleLinear()
		.range([0, width])
		.domain(d3.extent(data, (dataPoint) => dataPoint[0]));

	const area = d3
		.area()
		.curve(d3.curveNatural)
		.x((dataPoint) => xScale(dataPoint[0]))
		.y0(height)
		.y1((dataPoint) => yScale(dataPoint[1]));

	const line = d3
		.line()
		.curve(d3.curveNatural)
		.x((dataPoint) => xScale(dataPoint[0]))
		.y((dataPoint) => yScale(dataPoint[1]));
</script>

<svg class="bg-transparent text-gray-900 dark:text-gray-100" viewBox={`0 0 ${width} ${height / 2}`}>
	<g transform={`translate(${width / 2},${height / 2})`}>
		<path d={area()} fill="lightblue" />
		<path d={line()} fill="none" stroke-width="2px" stroke="steelblue" stroke-linejoin="round" stroke-linecap="round" />
	</g>
</svg>
