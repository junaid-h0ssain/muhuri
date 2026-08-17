import { pgTable, serial, integer, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export const product = pgTable('product', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	brand: text('brand').notNull(),
	year: integer('year').notNull(),
	category: text('category').notNull(),
	image_url: text('image_url'),
	description: text('description'),
	price: integer('price').notNull(),
	count: integer('count').notNull(),
	is_discounted: boolean('is_discounted').default(false).notNull(),
	discount_percentage: integer('discount_percentage').default(0).notNull(),
	created_at: timestamp('created_at').defaultNow().notNull(),
	updated_at: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	is_deleted: boolean('is_deleted').default(false).notNull(),
	deleted_at: timestamp('deleted_at'),
});

export const review = pgTable(
	'review',
	{
		id: serial('id').primaryKey(),
		product_id: integer('product_id')
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		user_id: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		rating: integer('rating').notNull(),
		comment: text('comment'),
		created_at: timestamp('created_at').defaultNow().notNull(),
		updated_at: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		is_deleted: boolean('is_deleted').default(false).notNull(),
		deleted_at: timestamp('deleted_at'),
	},
	(table) => [
		index('review_product_id_idx').on(table.product_id),
		index('review_user_id_idx').on(table.user_id),
	]
);

export const productRelations = relations(product, ({ many }) => ({
	reviews: many(review),
}));

export const reviewRelations = relations(review, ({ one }) => ({
	product: one(product, {
		fields: [review.product_id],
		references: [product.id],
	}),
	user: one(user, {
		fields: [review.user_id],
		references: [user.id],
	}),
}));

export * from './auth.schema';
