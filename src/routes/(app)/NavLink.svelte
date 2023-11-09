<script lang="ts">
	export let active: boolean;
	export let icon = 'tabler:file-search';
	export let route: string;
</script>

<a
	class="group relative flex w-3 items-center space-x-2 rounded-lg text-primary-600 transition-colors @container hover:bg-primary-500 hover:text-white aria-[current=page]:bg-primary-500 aria-[current=page]:text-white dark:text-neutral-309 md:w-full"
	aria-current={active ? 'page' : undefined}
	href={route}>
	<span
		aria-hidden="true"
		class="flex items-center rounded-lg p-3 transition-colors group-hover:bg-primary-600 group-hover:text-white group-aria-[current=page]:bg-primary-600">
		<iconify-icon class="h-6 w-6" {icon} height="auto" />
	</span>
	<span class="invisible @[6rem]:visible">
		<slot />
	</span>
</a>

<style lang="postcss">
	@media (min-width: 768px) {
		@container (max-width: 3rem) {
			.group:hover > span:last-of-type {
				left: 50px;
				opacity: 1;
				visibility: visible;
			}

			.group > span:last-of-type {
				background-color: #000;
				color: #fff;
				position: absolute;
				left: 70px;
				top: 50%;
				transform: translateY(-50%);
				padding: 10px;
				border-radius: 4px;
				opacity: 0;
				visibility: hidden;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

				&:after {
					content: '';
					background-color: #000;
					position: absolute;
					left: -5px;
					top: 20%;
					width: 20px;
					height: 20px;
					border-radius: 2px;
					transform: rotate(45deg);
					z-index: -1;
				}
			}
		}
	}
</style>
