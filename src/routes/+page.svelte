<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import type { PageData } from './$types';

	type Product = {
		id: number;
		name: string;
		brand: string;
		year: number;
		category: string;
		image_url?: string | null;
		description?: string | null;
		price: number;
		count: number;
		is_discounted: boolean;
		discount_percentage: number;
		created_at?: Date | string;
		updated_at?: Date | string;
		is_deleted?: boolean;
		deleted_at?: Date | string | null;
	};

	let { data }: { data: PageData } = $props();

	// Search & Filter state
	let searchQuery = $state('');
	let selectedBrand = $state('All');
	let selectedCategory = $state('All');
	let sortBy = $state<'featured' | 'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc'>('featured');
	let onlyDiscounted = $state(false);

	// Extract unique brands
	let brands = $derived.by(() => {
		const set = new Set<string>();
		(data.products as Product[])?.forEach((p) => {
			if (p.brand) set.add(p.brand);
		});
		return ['All', ...Array.from(set).sort()];
	});

	// Extract unique categories
	let categories = $derived.by(() => {
		const set = new Set<string>();
		(data.products as Product[])?.forEach((p) => {
			if (p.category) set.add(p.category);
		});
		return ['All', ...Array.from(set).sort()];
	});

	// Effective price calculator helper
	function getEffectivePrice(p: Product): number {
		if (p.is_discounted && p.discount_percentage > 0) {
			return p.price * (1 - p.discount_percentage / 100);
		}
		return p.price;
	}

	// Filtered & Sorted products list
	let filteredProducts = $derived.by(() => {
		let list = ((data.products as Product[]) || []).filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
			
			const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
			const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
			const matchesDiscount = !onlyDiscounted || p.is_discounted;

			return matchesSearch && matchesBrand && matchesCategory && matchesDiscount;
		});

		// Sort logic
		return list.sort((a, b) => {
			if (sortBy === 'price-asc') {
				return getEffectivePrice(a) - getEffectivePrice(b);
			}
			if (sortBy === 'price-desc') {
				return getEffectivePrice(b) - getEffectivePrice(a);
			}
			if (sortBy === 'discount-desc') {
				const discA = a.is_discounted ? a.discount_percentage : 0;
				const discB = b.is_discounted ? b.discount_percentage : 0;
				return discB - discA;
			}
			if (sortBy === 'name-asc') {
				return a.name.localeCompare(b.name);
			}
			// Default 'featured' (newest / ID desc)
			return b.id - a.id;
		});
	});

	function clearFilters() {
		searchQuery = '';
		selectedBrand = 'All';
		selectedCategory = 'All';
		sortBy = 'featured';
		onlyDiscounted = false;
	}
</script>

<svelte:head>
	<title>Muhuri - Store & Catalog</title>
	<meta name="description" content="Browse all products by brand, category, price, and discount." />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero / Banner Section -->
	<section class="border-b bg-muted/20 py-8 px-4 md:px-8">
		<div class="mx-auto max-w-7xl">
			<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
						Explore Products
					</h1>
					<p class="text-sm text-muted-foreground mt-1 max-w-xl">
						Discover top-rated tech, audio, and gear. Filter by your favorite brands or categories, and catch the best discounts.
					</p>
				</div>
				<div class="flex items-center gap-2 self-start md:self-auto">
					<span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold border border-primary/30 bg-primary/10 text-primary">
						{data.products?.length || 0} Products Available
					</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Main Container -->
	<div class="mx-auto max-w-7xl p-4 md:p-8 space-y-6">

		<!-- Controls Bar (Search, Brand, Category, Sort, Discount Toggle) -->
		<div class="bg-card border border-border p-4 shadow-xs space-y-4">
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				<!-- Search -->
				<div class="relative lg:col-span-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2.5 top-2.5 size-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
					<Input
						type="text"
						placeholder="Search product, brand, keyword..."
						bind:value={searchQuery}
						class="pl-8 text-xs h-9"
					/>
				</div>

				<!-- Brand Filter -->
				<div class="flex flex-col justify-center">
					<label for="brand-filter" class="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Brand</label>
					<select
						id="brand-filter"
						bind:value={selectedBrand}
						class="h-9 w-full border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
					>
						{#each brands as b}
							<option value={b}>{b}</option>
						{/each}
					</select>
				</div>

				<!-- Category Filter -->
				<div class="flex flex-col justify-center">
					<label for="category-filter" class="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Category</label>
					<select
						id="category-filter"
						bind:value={selectedCategory}
						class="h-9 w-full border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
					>
						{#each categories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>

				<!-- Sort Option -->
				<div class="flex flex-col justify-center">
					<label for="sort-filter" class="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Sort By</label>
					<select
						id="sort-filter"
						bind:value={sortBy}
						class="h-9 w-full border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
					>
						<option value="featured">Featured / Newest</option>
						<option value="price-asc">Price: Low to High</option>
						<option value="price-desc">Price: High to Low</option>
						<option value="discount-desc">Highest Discount</option>
						<option value="name-asc">Name: A to Z</option>
					</select>
				</div>
			</div>

			<!-- Active Filter Tags & Quick Checkbox -->
			<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
				<div class="flex flex-wrap items-center gap-2">
					<label class="flex items-center gap-1.5 text-xs cursor-pointer select-none border border-border px-2.5 py-1 bg-muted/20 hover:bg-muted/40 transition-colors">
						<input
							type="checkbox"
							bind:checked={onlyDiscounted}
							class="size-3.5 border-input"
						/>
						<span class="font-medium text-foreground">Discounted Deals Only</span>
					</label>

					{#if searchQuery || selectedBrand !== 'All' || selectedCategory !== 'All' || sortBy !== 'featured' || onlyDiscounted}
						<Button variant="ghost" size="sm" onclick={clearFilters} class="h-7 text-xs text-muted-foreground hover:text-foreground">
							Clear All Filters
						</Button>
					{/if}
				</div>

				<div class="text-xs text-muted-foreground">
					Showing <strong class="text-foreground">{filteredProducts.length}</strong> of {data.products?.length || 0} products
				</div>
			</div>
		</div>

		<!-- Product Grid -->
		{#if filteredProducts.length === 0}
			<div class="border border-dashed border-border p-12 text-center bg-card">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-muted-foreground mb-3 size-10"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
				<h3 class="text-base font-bold text-foreground">No Products Found</h3>
				<p class="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
					No items match your active filters. Try adjusting your search query, category, or brand selection.
				</p>
				<Button variant="outline" size="sm" onclick={clearFilters} class="mt-4 text-xs">
					Reset All Filters
				</Button>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each filteredProducts as p (p.id)}
					<Card class="group flex flex-col justify-between border border-border overflow-hidden bg-card hover:border-primary/50 transition-all duration-200 shadow-2xs">
						<!-- Image Container -->
						<div class="relative w-full aspect-4/3 bg-muted/40 overflow-hidden flex items-center justify-center">
							{#if p.image_url}
								<img
									src={p.image_url}
									alt={p.name}
									class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
							{:else}
								<div class="flex flex-col items-center gap-1 text-muted-foreground/60">
									<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-8"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
									<span class="text-[10px]">No image available</span>
								</div>
							{/if}

							<!-- Discount Badge -->
							{#if p.is_discounted && p.discount_percentage > 0}
								<span class="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
									-{p.discount_percentage}% OFF
								</span>
							{/if}

							<!-- Stock status tag -->
							{#if p.count === 0}
								<span class="absolute top-2 right-2 z-10 bg-zinc-900/80 text-white px-2 py-0.5 text-[10px] font-semibold uppercase">
									Out of Stock
								</span>
							{:else if p.count < 5}
								<span class="absolute top-2 right-2 z-10 bg-amber-500/90 text-white px-2 py-0.5 text-[10px] font-semibold uppercase">
									Only {p.count} Left
								</span>
							{/if}
						</div>

						<!-- Content -->
						<div class="p-4 flex-1 flex flex-col justify-between space-y-3">
							<div>
								<div class="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
									<span class="font-semibold text-primary/80 uppercase tracking-wider">{p.brand}</span>
									<span class="border border-border px-1.5 py-0.2 text-[10px] bg-muted/30">{p.category}</span>
								</div>

								<h2 class="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={p.name}>
									{p.name}
								</h2>

								{#if p.description}
									<p class="text-xs text-muted-foreground line-clamp-2 mt-1">
										{p.description}
									</p>
								{/if}
							</div>

							<!-- Price & Action -->
							<div class="pt-2 border-t border-border flex items-end justify-between gap-2">
								<div>
									{#if p.is_discounted && p.discount_percentage > 0}
										<div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
											${(p.price * (1 - p.discount_percentage / 100)).toFixed(2)}
										</div>
										<div class="text-[11px] text-muted-foreground line-through">
											${p.price.toFixed(2)}
										</div>
									{:else}
										<div class="text-base font-extrabold text-foreground">
											${p.price.toFixed(2)}
										</div>
									{/if}
								</div>

								<Button size="sm" variant="default" class="text-xs h-8 px-3">
									View Product
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>
