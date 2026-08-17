import { seed } from 'drizzle-seed';
import { getDb } from './index'; // your drizzle client
import * as schema from './schema';
import { sql } from 'drizzle-orm';

async function runSeed() {
    console.log('Seeding 1,000 products...');
    const db = getDb();

    // Clear existing products and reset auto-increment sequence
    await db.execute(sql`TRUNCATE TABLE product CASCADE;`);

    await seed(db, { product: schema.product }).refine((f) => ({
        product: {
            count: 1000,
            columns: {
                // Pick electronics categories from a fixed list
                category: f.valuesFromArray({
                    values: ['Laptops', 'Smartphones', 'Audio', 'Monitors', 'Peripherals', 'Tablets', 'Gaming'],
                }),
                // Pick tech brands
                brand: f.valuesFromArray({
                    values: ['Apple', 'Samsung', 'Sony', 'Dell', 'Lenovo', 'Asus', 'Logitech', 'Bose'],
                }),
                // Constrain release year
                year: f.int({ minValue: 2018, maxValue: 2026 }),
                // Price in cents (e.g. $19.99 to $2,999.00)
                price: f.int({ minValue: 1999, maxValue: 299900 }),
                count: f.int({ minValue: 0, maxValue: 150 }),
                discount_percentage: f.int({ minValue: 0, maxValue: 40 }),
                // Random image placehold
                image_url: f.valuesFromArray({
                    values: [
                        'https://picsum.photos/seed/tech1/600/600',
                        'https://picsum.photos/seed/tech2/600/600',
                        'https://picsum.photos/seed/tech3/600/600',
                        'https://picsum.photos/seed/tech4/600/600',
                    ],
                }),
            },
        },
    }));

    console.log('Seeding completed!');
    process.exit(0);
}

runSeed();