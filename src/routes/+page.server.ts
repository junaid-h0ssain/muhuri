import { getDb } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = getDb();
	const products = await db
		.select()
		.from(product)
		.where(eq(product.is_deleted, false))
		.orderBy(desc(product.id));

	return {
		products
	};
};
