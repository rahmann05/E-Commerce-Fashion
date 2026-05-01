<script lang="ts">
	import { env } from '$env/dynamic/public';
	let { data } = $props();
	
	function getImageUrl(url: string | null) {
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

<div class="hero-header">
	<div style="display: flex; justify-content: space-between; align-items: flex-end;">
		<div>
			<h1 class="editorial-title">Collections</h1>
			<p class="editorial-subtitle" style="margin-top: 1rem;">Architecting the brand structure through refined groupings.</p>
		</div>
		<a href="/categories/new" class="btn-studio">
			+ New Collection
		</a>
	</div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 3rem; margin-top: 2rem;">
	{#each data.categories as category}
		{@const displayImage = category.image || (category.products[0]?.images[0] || null)}
		<a href="/categories/{category.id}" class="insight-card collection-card" style="padding: 0; overflow: hidden; text-decoration: none; color: inherit; transition: transform 0.4s ease;">
			<div style="height: 350px; background: #f8f8f8; position: relative; overflow: hidden;">
				{#if displayImage}
					<img src={getImageUrl(displayImage)} alt={category.name} style="width: 100%; height: 100%; object-fit: cover;" />
				{:else}
					<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; opacity: 0.05; font-weight: 900;">
						{category.name.charAt(0)}
					</div>
				{/if}
				<div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 3rem; background: linear-gradient(to top, rgba(0,0,0,0.4), transparent); color: #fff;">
					<div style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.8; margin-bottom: 0.5rem;">{category._count.products} Products</div>
					<div style="font-size: 2.2rem; font-weight: 900; letter-spacing: -0.04em;">{category.name}</div>
				</div>
			</div>
			<div style="padding: 2.5rem;">
				<p style="font-size: 0.95rem; color: #666; line-height: 1.6; margin: 0;">
					{category.description || 'Essential items curated for the modern wardrobe. Defined by quality, purpose, and timeless aesthetic.'}
				</p>
				<div style="margin-top: 2rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #111; display: flex; align-items: center; gap: 0.5rem;">
					Manage Structure <span>→</span>
				</div>
			</div>
		</a>
	{/each}
</div>

{#if data.categories.length === 0}
	<div style="text-align: center; padding: 10rem 0; opacity: 0.2;">
		<h2 style="font-size: 3rem; font-weight: 800;">Empty Archive</h2>
	</div>
{/if}

<style>
	.collection-card:hover {
		transform: translateY(-10px);
		box-shadow: 0 40px 80px rgba(0,0,0,0.1) !important;
	}
	.collection-card:hover img {
		transform: scale(1.05);
	}
	img {
		transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}
</style>
