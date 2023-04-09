Finanzen is the app,
Finanseer are the dashboards in Finanzen.

this app uses Buxfer api for Finance data for Analytical Dashboards.
SvelteKit framework.
Authjs - authentication, and invite only access.

.env.example - environment variables for settings specific to usage.

clone repo and update .env(.env.[environment]) variables to personal preference.
create planetscale db and push prisma schema to db

```bash
    pnpm db:push
```

run prisma generate for client and zod types & prisma seed for admin creds to work.

```bash
    pnpm prisma:generate && pnpm db:seed
```

run app or deploy through vercel.

```bash
    # dev
    pnpm dev --open
    # release/prod preview
    pnpm preview --open
```

# Todos:

- make BuxferApi integration more adaptable, and flexable/modular ex. be able to use Empower(PersonalCapital) or Plaid.
- make graphical analytical dashboards.

# Sveltekit

## create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

### Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

### Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
