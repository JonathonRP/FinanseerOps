<script lang="ts">
	import { dev } from '$app/environment';
</script>

<section
	class="relative mx-auto flex h-full w-11/12 items-center self-center overflow-hidden rounded-3xl bg-gradient-to-t from-[#141521] to-[#141521]">
	<svg class="absolute" fill="none" height="100%" viewBox="0 0 400 400" width="100%" xmlns="http://www.w3.org/2000/svg">
		<g clip-path="url(#clip0_17_17)">
			<g filter="url(#filter0_f_17_17)">
				<path d="M128.6 0H0V322.2L51.5 67.5L128.6 0Z" fill="#EB03FF"></path>
				<path d="M0 322.2V400H240H320L51.5 67.5L0 322.2Z" fill="#FF0F9F"></path>
				<path d="M320 400H400V78.75L51.5 67.5L320 400Z" fill="#3A0D84"></path>
				<path d="M400 0H128.6L51.5 67.5L400 78.75V0Z" fill="#FAD8F4"></path>
			</g>
		</g>
		<defs>
			<filter
				color-interpolation-filters="sRGB"
				filterUnits="userSpaceOnUse"
				height="720.666"
				id="filter0_f_17_17"
				width="720.666"
				x="-160.333"
				y="-160.333">
				<feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
				<feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape"></feBlend>
				<feGaussianBlur result="effect1_foregroundBlur_17_17" stdDeviation="80.1666"></feGaussianBlur>
			</filter>
		</defs>
	</svg>
	<div class="relative mx-auto w-full max-w-7xl items-center gap-12 rounded-3xl p-8 lg:inline-flex lg:p-20 lg:py-32">
		<div class="mx-auto max-w-4xl text-center">
			<div>
				<span class="inline-flex items-center"
					><span class="rounded-lg px-6 py-2 text-base font-bold uppercase text-white">Finanzen</span></span>
				<p class="mx-auto mt-8 text-2xl font-extrabold tracking-tight text-white md:text-4xl">
					Budget and Expense tracker for anyone
					<span class="md:block">looking to optimise spending habits and behaviors</span>
				</p>
				<p class="mx-auto mt-4 max-w-3xl text-slate-200 lg:text-lg">
					Finanzen is a finance tracker with analytics, budgets, calendars, family sharing and more, to help you manage
					your budget and spending behavior. Share your email so we can tell you when we are launching.
				</p>
			</div>
			<div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
				<form class="w-full rounded-2xl bg-white/20 p-1.5 lg:mx-auto lg:w-auto" method="post" action="/">
					<div class="w-full lg:flex lg:items-center">
						<div class="shrink">
							<input
								id="email"
								name="email"
								aria-label="Email address"
								autocomplete="email"
								class="block w-full appearance-none rounded-xl border border-transparent bg-transparent p-3 text-black placeholder:text-slate-300 focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
								placeholder="Email address"
								required={!dev}
								type="email" />
						</div>
						<button
							class="0 relative inline-flex w-full flex-none justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-indigo-500 outline-2 outline-offset-2 before:transition-colors hover:bg-indigo-900 hover:text-white active:bg-slate-600 active:text-white/80 lg:ml-4 lg:w-auto"
							type="submit">
							<span>Join the waitlist</span>
						</button>
					</div>
				</form>
			</div>
			<div class="mt-3">
				<span class="text-white">Get to known when we will launch. We won't share your email.</span>
			</div>
			<div class="mx-auto mt-12 flex-col sm:flex sm:max-w-lg">
				<p class="text-base text-white">by Finanzen</p>
			</div>
		</div>
	</div>
</section>
