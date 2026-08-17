<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card } from '$lib/components/ui/card';
	import type { PageData, ActionData } from './$types';

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

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Search & Filter state
	let searchQuery = $state('');
	let selectedCategory = $state('All');

	// Modal / Dialog states
	let isEditDialogOpen = $state(false);
	let isDeleteDialogOpen = $state(false);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Currently active product for edit / delete
	let editingProduct = $state<{
		id?: number;
		name: string;
		brand: string;
		year: number;
		category: string;
		image_url: string;
		description: string;
		price: number;
		count: number;
		is_discounted: boolean;
		discount_percentage: number;
	}>({
		name: '',
		brand: '',
		year: new Date().getFullYear(),
		category: '',
		image_url: '',
		description: '',
		price: 0,
		count: 0,
		is_discounted: false,
		discount_percentage: 0
	});

	let productToDelete = $state<{ id: number; name: string } | null>(null);

	// Derived categories
	let categories = $derived.by(() => {
		const set = new Set<string>();
		(data.products as Product[])?.forEach((p) => {
			if (p.category) set.add(p.category);
		});
		return ['All', ...Array.from(set)];
	});

	// Filtered products list
	let filteredProducts = $derived.by(() => {
		return ((data.products as Product[]) || []).filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.category.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	});

	function openCreateDialog() {
		editingProduct = {
			name: '',
			brand: '',
			year: new Date().getFullYear(),
			category: '',
			image_url: '',
			description: '',
			price: 0,
			count: 0,
			is_discounted: false,
			discount_percentage: 0
		};
		isEditDialogOpen = true;
	}

	function openEditDialog(p: Product) {
		editingProduct = {
			id: p.id,
			name: p.name,
			brand: p.brand,
			year: p.year,
			category: p.category,
			image_url: p.image_url || '',
			description: p.description || '',
			price: p.price,
			count: p.count,
			is_discounted: Boolean(p.is_discounted),
			discount_percentage: p.discount_percentage || 0
		};
		isEditDialogOpen = true;
	}

	function confirmDelete(p: { id: number; name: string }) {
		productToDelete = p;
		isDeleteDialogOpen = true;
	}
</script>

<svelte:head>
	<title>Admin - Product Management</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:p-8">
	<div class="mx-auto max-w-7xl space-y-6">
		<!-- Header -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6 text-primary"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
					Product Management
				</h1>
				<p class="text-xs text-muted-foreground mt-1">
					Add, update, search, and manage inventory products.
				</p>
			</div>
			<Button onclick={openCreateDialog} variant="default" size="default" class="gap-1.5 self-start sm:self-auto">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
				Add Product
			</Button>
		</div>

		<!-- Notifications -->
		{#if form?.error}
			<div class="flex items-center gap-2 border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
				<span>{form.error}</span>
			</div>
		{/if}

		{#if form?.success}
			<div class="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
				<span>{form.message}</span>
			</div>
		{/if}

		<!-- Controls (Search & Category Filter) -->
		<div class="grid gap-3 md:grid-cols-3">
			<div class="relative md:col-span-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2.5 top-2.5 size-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<Input
					type="text"
					placeholder="Search products by name, brand, or category..."
					bind:value={searchQuery}
					class="pl-8 text-xs"
				/>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-medium text-muted-foreground shrink-0">Category:</span>
				<select
					bind:value={selectedCategory}
					class="h-8 w-full border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
				>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Products Summary Stats -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<Card class="p-4 border border-border">
				<div class="text-xs font-medium text-muted-foreground">Total Products</div>
				<div class="text-xl font-bold mt-1">{data.products?.length || 0}</div>
			</Card>
			<Card class="p-4 border border-border">
				<div class="text-xs font-medium text-muted-foreground">Filtered Results</div>
				<div class="text-xl font-bold mt-1">{filteredProducts.length}</div>
			</Card>
			<Card class="p-4 border border-border">
				<div class="text-xs font-medium text-muted-foreground">Discounted Items</div>
				<div class="text-xl font-bold mt-1">{(data.products as Product[])?.filter((p: Product) => p.is_discounted).length || 0}</div>
			</Card>
			<Card class="p-4 border border-border">
				<div class="text-xs font-medium text-muted-foreground">Low Stock (&lt; 5)</div>
				<div class="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{(data.products as Product[])?.filter((p: Product) => p.count < 5).length || 0}</div>
			</Card>
		</div>

		<!-- Products Table -->
		<div class="border border-border overflow-x-auto bg-card">
			<table class="w-full text-left text-xs">
				<thead class="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="px-4 py-3">ID</th>
						<th class="px-4 py-3">Product Name</th>
						<th class="px-4 py-3">Brand & Year</th>
						<th class="px-4 py-3">Category</th>
						<th class="px-4 py-3 text-right">Price</th>
						<th class="px-4 py-3 text-right">Stock</th>
						<th class="px-4 py-3 text-center">Status</th>
						<th class="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y">
					{#if filteredProducts.length === 0}
						<tr>
							<td colspan="8" class="px-4 py-8 text-center text-muted-foreground">
								No products found matching your search.
							</td>
						</tr>
					{:else}
						{#each filteredProducts as p (p.id)}
							<tr class="hover:bg-muted/20 transition-colors">
								<td class="px-4 py-3 font-mono text-muted-foreground">#{p.id}</td>
								<td class="px-4 py-3">
									<div class="font-medium text-foreground">{p.name}</div>
									{#if p.description}
										<div class="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
											{p.description}
										</div>
									{/if}
								</td>
								<td class="px-4 py-3">
									<span class="font-medium">{p.brand}</span>
									<span class="text-[11px] text-muted-foreground ml-1">({p.year})</span>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex items-center gap-1 border border-border px-2 py-0.5 text-[11px] bg-muted/30">
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3 text-muted-foreground"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.41 2.41 0 0 0 3.408 0l5.88-5.88a2.41 2.41 0 0 0 0-3.408z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
										{p.category}
									</span>
								</td>
								<td class="px-4 py-3 text-right font-medium">
									{#if p.is_discounted}
										<div class="text-emerald-600 dark:text-emerald-400 font-bold">
											${(p.price * (1 - p.discount_percentage / 100)).toFixed(2)}
										</div>
										<div class="text-[10px] text-muted-foreground line-through">
											${p.price.toFixed(2)} (-{p.discount_percentage}%)
										</div>
									{:else}
										${p.price.toFixed(2)}
									{/if}
								</td>
								<td class="px-4 py-3 text-right font-mono">
									<span class={p.count < 5 ? 'text-destructive font-bold' : ''}>
										{p.count}
									</span>
								</td>
								<td class="px-4 py-3 text-center">
									{#if p.is_discounted}
										<span class="px-1.5 py-0.5 text-[10px] border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
											Discounted
										</span>
									{:else}
										<span class="px-1.5 py-0.5 text-[10px] border border-border bg-muted/20 text-muted-foreground uppercase tracking-wide">
											Standard
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-right space-x-1">
									<Button
										size="icon-xs"
										variant="outline"
										onclick={() => openEditDialog(p)}
										title="Edit Product"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
									</Button>
									<Button
										size="icon-xs"
										variant="destructive"
										onclick={() => confirmDelete(p)}
										title="Delete Product"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
									</Button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- EDIT / CREATE PRODUCT DIALOG MODAL -->
{#if isEditDialogOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
		<div class="w-full max-w-xl border bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto space-y-4">
			<div class="flex items-center justify-between border-b pb-3">
				<h2 class="text-base font-bold text-foreground flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-primary"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
					{editingProduct.id ? `Edit Product #${editingProduct.id}` : 'Add New Product'}
				</h2>
				<button
					type="button"
					aria-label="Close dialog"
					onclick={() => (isEditDialogOpen = false)}
					class="text-muted-foreground hover:text-foreground"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/saveProduct"
				use:enhance={() => {
					isSaving = true;
					return async ({ result }) => {
						isSaving = false;
						if (result.type === 'success') {
							isEditDialogOpen = false;
						}
						await applyAction(result);
					};
				}}
				class="space-y-4 text-xs"
			>
				{#if editingProduct.id}
					<input type="hidden" name="id" value={editingProduct.id} />
				{/if}

				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1 sm:col-span-2">
						<label for="name" class="font-medium text-foreground">Product Name *</label>
						<Input
							id="name"
							name="name"
							type="text"
							required
							placeholder="e.g. Wireless Noise-Canceling Headphones"
							bind:value={editingProduct.name}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="brand" class="font-medium text-foreground">Brand *</label>
						<Input
							id="brand"
							name="brand"
							type="text"
							required
							placeholder="e.g. Sony"
							bind:value={editingProduct.brand}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="category" class="font-medium text-foreground">Category *</label>
						<Input
							id="category"
							name="category"
							type="text"
							required
							placeholder="e.g. Audio, Electronics"
							bind:value={editingProduct.category}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1 sm:col-span-2">
						<label for="image_url" class="font-medium text-foreground">Image URL</label>
						<Input
							id="image_url"
							name="image_url"
							type="url"
							placeholder="e.g. https://images.unsplash.com/photo-..."
							bind:value={editingProduct.image_url}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="year" class="font-medium text-foreground">Release Year *</label>
						<Input
							id="year"
							name="year"
							type="number"
							required
							min="1900"
							max="2099"
							bind:value={editingProduct.year}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="count" class="font-medium text-foreground">Stock Quantity *</label>
						<Input
							id="count"
							name="count"
							type="number"
							required
							min="0"
							bind:value={editingProduct.count}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="price" class="font-medium text-foreground">Price *</label>
						<Input
							id="price"
							name="price"
							type="number"
							required
							min="0"
							step="1"
							bind:value={editingProduct.price}
							class="text-xs"
						/>
					</div>

					<div class="space-y-1">
						<label for="discount_percentage" class="font-medium text-foreground">Discount (%)</label>
						<Input
							id="discount_percentage"
							name="discount_percentage"
							type="number"
							min="0"
							max="100"
							disabled={!editingProduct.is_discounted}
							bind:value={editingProduct.discount_percentage}
							class="text-xs"
						/>
					</div>
				</div>

				<div class="flex items-center gap-2 border p-2 bg-muted/20">
					<input
						type="checkbox"
						id="is_discounted"
						name="is_discounted"
						bind:checked={editingProduct.is_discounted}
						class="size-4 border-input"
					/>
					<label for="is_discounted" class="font-medium text-foreground cursor-pointer select-none">
						Enable Discount for this product
					</label>
				</div>

				<div class="space-y-1">
					<label for="description" class="font-medium text-foreground">Description</label>
					<textarea
						id="description"
						name="description"
						rows="3"
						placeholder="Detailed product features, specifications, etc..."
						bind:value={editingProduct.description}
						class="w-full border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
					></textarea>
				</div>

				<div class="flex items-center justify-end gap-2 border-t pt-3">
					<Button
						type="button"
						variant="outline"
						onclick={() => (isEditDialogOpen = false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button type="submit" variant="default" disabled={isSaving}>
						{isSaving ? 'Saving...' : editingProduct.id ? 'Save Changes' : 'Create Product'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- DELETE CONFIRMATION DIALOG MODAL -->
{#if isDeleteDialogOpen && productToDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
		<div class="w-full max-w-md border bg-background p-6 shadow-lg space-y-4">
			<div class="flex items-center justify-between border-b pb-3">
				<h2 class="text-base font-bold text-destructive flex items-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> Delete Product
				</h2>
				<button
					type="button"
					aria-label="Close dialog"
					onclick={() => (isDeleteDialogOpen = false)}
					class="text-muted-foreground hover:text-foreground"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</button>
			</div>

			<p class="text-xs text-muted-foreground">
				Are you sure you want to delete <strong class="text-foreground">{productToDelete.name}</strong> (ID: #{productToDelete.id})? This action will remove it from the active catalog.
			</p>

			<form
				method="POST"
				action="?/deleteProduct"
				use:enhance={() => {
					isDeleting = true;
					return async ({ result }) => {
						isDeleting = false;
						if (result.type === 'success') {
							isDeleteDialogOpen = false;
							productToDelete = null;
						}
						await applyAction(result);
					};
				}}
				class="flex items-center justify-end gap-2 border-t pt-3"
			>
				<input type="hidden" name="id" value={productToDelete.id} />
				<Button
					type="button"
					variant="outline"
					onclick={() => (isDeleteDialogOpen = false)}
					disabled={isDeleting}
				>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Confirm Delete'}
				</Button>
			</form>
		</div>
	</div>
{/if}
