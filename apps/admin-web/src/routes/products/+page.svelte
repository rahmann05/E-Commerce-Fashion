<script lang="ts">
	import ProductGrid from '@features/catalog/ProductGrid.svelte';
	import ProductFilter from '@features/catalog/ProductFilter.svelte';
	
	let { data } = $props();
	const products = $derived(data.products);
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

	<ProductFilter 
		categories={data.categories} 
		currentCategory={data.currentCategory} 
		query={data.query} 
	/>
</div>

<ProductGrid {products} />
