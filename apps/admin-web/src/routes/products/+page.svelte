<script lang="ts">
	import { env } from '$env/dynamic/public';
	let { data } = $props();
	const products = $derived(data.products);

	function formatCurrency(amount: number) {
		const finalAmount = amount < 10000 ? amount * 1000 : amount;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(finalAmount);
	}

	function getImageUrl(url: string) {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		
		const SUPABASE_URL = env.PUBLIC_SUPABASE_URL;
		const BUCKET_NAME = 'products';
		
		let cleanPath = url.startsWith('/') ? url.slice(1) : url;
		if (cleanPath.startsWith('images/')) {
			cleanPath = cleanPath.replace('images/', '');
		}
		return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
	}
</script>

<div class="studio-section" style="margin-bottom: 2rem;">
	<div style="display: flex; justify-content: space-between; align-items: flex-end;">
		<div>
			<h1 class="editorial-title">Catalogue</h1>
			<p class="editorial-subtitle" style="margin-top: 1rem;">Curating the essential flow of the brand archive.</p>
		</div>
		<div style="display: flex; gap: 2rem; align-items: center;">
			<form method="GET" style="position: relative;">
				<input 
					type="text" 
					name="q" 
					placeholder="Search..." 
					value={data.query}
					class="input-control" 
					style="padding: 1rem 1.5rem; width: 300px; border-radius: 999px; background: var(--surface-soft);"
				/>
				{#if data.currentCategory}
					<input type="hidden" name="category" value={data.currentCategory} />
				{/if}
			</form>
			<a href="/products/new" class="btn-studio">
				+ New Entry
			</a>
		</div>
	</div>

	<!-- Category Segmentation -->
	<div style="display: flex; gap: 3rem; margin-top: 4rem; padding-bottom: 1rem; overflow-x: auto;">
		<a 
			href="/products{data.query ? `?q=${data.query}` : ''}" 
			class="nav-item { !data.currentCategory ? 'active' : ''}"
			style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;"
		>
			All Collections
		</a>
		{#each data.categories as cat}
			<a 
				href="/products?category={cat.id}{data.query ? `&q=${data.query}` : ''}" 
				class="nav-item { data.currentCategory === cat.id ? 'active' : ''}"
				style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;"
			>
				{cat.name}
			</a>
		{/each}
	</div>
</div>

<div class="entry-grid">
	{#each products as product}
		<a href="/products/{product.id}" class="product-entry" style="text-decoration: none; color: inherit;">
			<div class="entry-image">
				{#if (product.image && product.image.length > 0) || (product.images && product.images.length > 0)}
					{@const displayImage = product.image?.[0] || product.images?.[0]}
					<img src={getImageUrl(displayImage)} alt={product.name} />
				{:else}
					<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; opacity: 0.1; font-weight: 900; background: #f0f0f0;">
						{product.name.charAt(0)}
					</div>
				{/if}
			</div>

			<div class="entry-info">
				<div style="flex: 1; min-width: 0; padding-right: 1rem;">
					<div class="entry-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{product.name}</div>
					<div class="entry-meta">{product.category?.name || 'ESSENTIAL'} · {product.stock} IN STOCK</div>
				</div>
				<div class="entry-price">{formatCurrency(product.price)}</div>
			</div>
		</a>
	{/each}
</div>

{#if products.length === 0}
	<div class="studio-section" style="text-align: center; padding: 10rem 0; opacity: 0.1;">
		<h2 style="font-size: 4rem; font-weight: 900; letter-spacing: -0.05em;">Empty Archive</h2>
	</div>
{/if}
