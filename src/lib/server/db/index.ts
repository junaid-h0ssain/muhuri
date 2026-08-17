import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

export function getDb() {
    const url = env.DATABASE_URL!;
    if (!env.DATABASE_URL && !building) {
        throw new Error('DATABASE_URL is not set');
    }

    const client = neon(url);

    return drizzle(client, { schema });
}