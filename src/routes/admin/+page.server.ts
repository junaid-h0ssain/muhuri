import { getDb } from '$lib/server/db';
import { product } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail, type Actions } from '@sveltejs/kit';
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

export const actions: Actions = {
	saveProduct: async ({ request }) => {
		const formData = await request.formData();
		const idStr = formData.get('id')?.toString();
		const name = formData.get('name')?.toString()?.trim();
		const brand = formData.get('brand')?.toString()?.trim();
		const yearStr = formData.get('year')?.toString();
		const category = formData.get('category')?.toString()?.trim();
		const imageUrl = formData.get('image_url')?.toString()?.trim() || null;
		const description = formData.get('description')?.toString()?.trim() || null;
		const priceStr = formData.get('price')?.toString();
		const countStr = formData.get('count')?.toString();
		const isDiscounted = formData.get('is_discounted') === 'on' || formData.get('is_discounted') === 'true';
		const discountPercentageStr = formData.get('discount_percentage')?.toString();

		if (!name || !brand || !yearStr || !category || priceStr === undefined || countStr === undefined) {
			return fail(400, { error: 'Please fill in all required fields.' });
		}

		const year = parseInt(yearStr, 10);
		const price = parseInt(priceStr, 10);
		const count = parseInt(countStr, 10);
		const discount_percentage = discountPercentageStr ? parseInt(discountPercentageStr, 10) : 0;

		if (isNaN(year) || isNaN(price) || isNaN(count) || isNaN(discount_percentage)) {
			return fail(400, { error: 'Year, price, count, and discount must be valid numbers.' });
		}

		const db = getDb();

		try {
			if (idStr) {
				const id = parseInt(idStr, 10);
				await db
					.update(product)
					.set({
						name,
						brand,
						year,
						category,
						image_url: imageUrl,
						description,
						price,
						count,
						is_discounted: isDiscounted,
						discount_percentage: isDiscounted ? discount_percentage : 0,
						updated_at: new Date()
					})
					.where(eq(product.id, id));

				return { success: true, message: 'Product updated successfully.' };
			} else {
				await db.insert(product).values({
					name,
					brand,
					year,
					category,
					image_url: imageUrl,
					description,
					price,
					count,
					is_discounted: isDiscounted,
					discount_percentage: isDiscounted ? discount_percentage : 0
				});

				return { success: true, message: 'Product created successfully.' };
			}
		} catch (err: any) {
			console.error('Error saving product:', err);
			return fail(500, { error: 'Failed to save product due to a database error.' });
		}
	},

	deleteProduct: async ({ request }) => {
		const formData = await request.formData();
		const idStr = formData.get('id')?.toString();

		if (!idStr) {
			return fail(400, { error: 'Product ID is required for deletion.' });
		}

		const id = parseInt(idStr, 10);
		const db = getDb();

		try {
			await db
				.update(product)
				.set({
					is_deleted: true,
					deleted_at: new Date()
				})
				.where(eq(product.id, id));

			return { success: true, message: 'Product deleted successfully.' };
		} catch (err: any) {
			console.error('Error deleting product:', err);
			return fail(500, { error: 'Failed to delete product.' });
		}
	}
};
