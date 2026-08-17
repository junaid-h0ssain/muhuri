import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
let envUrl: string | undefined;
try {
    const { env } = await import('$env/dynamic/private');
    envUrl = env.DATABASE_URL;
} catch {
    envUrl = process.env.DATABASE_URL;
}

export function getDb() {
    const url = envUrl ?? process.env.DATABASE_URL;

    if (!url) {
        throw new Error('DATABASE_URL is not set');
    }

    const client = neon(url);

    return drizzle(client, { schema });
}