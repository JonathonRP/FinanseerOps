<script lang="ts">
	import { Motion, MotionConfig } from 'svelte-motion';
	import { resize } from 'svelte-resize-observer-action';

	let height: number;
</script>

<MotionConfig
	transition={{
		duration: 0.25,
		type: 'spring',
		bounce: 0,
	}}>
	<Motion let:motion initial={false} animate={{ height, opacity: 1 }} exit={{ opacity: 0, height }}>
		<div use:motion {...$$restProps}>
			<div
				use:resize={(entry) => {
					if (entry.contentRect.height >= 204 && entry.contentRect.height <= 305) {
						height = entry.contentRect.height;
					}
					// console.log(entry.contentRect.height);
				}}>
				<slot />
			</div>
		</div>
	</Motion>
</MotionConfig>
