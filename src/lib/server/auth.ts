import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';

import { building } from '$app/environment';

export const auth = betterAuth({
    baseURL: env.ORIGIN || process.env.ORIGIN || (building ? 'http://localhost:5173' : undefined),
    secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || (building ? 'build-phase-dummy-secret-key-min-32-chars' : undefined),
    database: drizzleAdapter(getDb(), { provider: 'pg' }),
    emailAndPassword: { enabled: true },
    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET
        }
    },
    plugins: [
        sveltekitCookies(getRequestEvent)
    ]
});