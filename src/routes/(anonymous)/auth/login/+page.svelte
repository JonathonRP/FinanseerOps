<svelte:options runes={true} />
<script lang="ts">
	import { icons } from '$/icons';
	import { applyAction, enhance } from '$app/forms';
	import { signIn } from '@auth/sveltekit/client';
	import toast from 'svelte-french-toast';

    const { data } = $props<{ data: import('./$types').PageData }>();
    const { url: { searchParams } } = $derived(data);
</script>

<main class="flex flex-1 flex-col items-center justify-center overflow-hidden">
	<div class="w-[368px] pt-1 grid md:flex rounded-2xl bg-slate-200 overflow-hidden dark:bg-neutral-808 dark:text-neutral-309">
        <div class="flex h-full w-full justify-center items-center p-4">
            <form class="h-full w-full" method="post" use:enhance={async () => {

                return async ({result, update}) => {
                    switch (result.type) {
                        case 'success':
                            await update();
                            const redirectTo = searchParams.get('redirectTo');
                            await signIn('email', { email: result.data?.email, callbackUrl: redirectTo ? `/${redirectTo.slice(1)}` : undefined, redirect: !!redirectTo });
                            break;
                        case 'failure':
                            const [firstError] = Object.keys(result.data?.errors);
                            toast.error(result.data?.errors[firstError][0]);
                            break;
                    }
                    await applyAction(result)
                }
            }}>
                <label class="px-1 font-bold" for="email">Email</label>
                <div class="flex items-center border-2 py-2 px-3 rounded-2xl mt-2 mb-4 border-neutral-309 dark:border-neutral-500">
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg> -->
                    <svelte:component this={icons.Email} class='h5 w-5 text-gray-400' height='auto' inline />
                    <input class="pl-2 outline-none border-none bg-transparent focus-visible:ring-0" type="email" name="email" id="email" placeholder="Email" />
                </div>
                <button type="submit" class="block h-16 w-full bg-orange-600 text-white py-2 my-4 rounded-xl mb-2 text-lg leading-6 font-semibold">Sign in with Email</button>
            </form>
        </div>
	</div>
</main>