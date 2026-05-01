<script lang="ts">
	import { enhance } from '$app/forms';
	import UploadImage from '$lib/components/UploadImage.svelte';
	import { env } from '$env/dynamic/public';
	
	let { data } = $props();
	let imageUrl = $state(data.category.image || '');
	let isModalOpen = $state(false);
	let searchQuery = $state('');

	const filteredProducts = $derived(
		data.allProducts.filter((p: any) =>
			p.categoryId !== data.category.id &&
			p.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

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
	<h1 class="editorial-title">Refine Collection</h1>
	<p class="editorial-subtitle">Architecting the structural identity of {data.category.name}.</p>
</div>

<div class="form-card">
	<form method="POST" action="?/update" use:enhance>
		<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;">
			<div class="form-main-section">
				<div class="input-group">
					<label class="input-label" for="name">Collection Name</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						class="input-control" 
						value={data.category.name}
						required 
					/>
				</div>

				<div class="input-group">
					<label class="input-label" for="description">Description</label>
					<textarea 
						id="description" 
						name="description" 
						class="input-control" 
						style="min-height: 150px; resize: vertical;"
						required
					>{data.category.description || ''}</textarea>
				</div>

				<!-- Collection Products Grid -->
				<div style="margin-top: 5rem;">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
						<h3 style="font-size: 1.1rem; font-weight: 900; margin: 0;">Collection Content</h3>
						<button 
							type="button" 
							class="btn-studio" 
							style="padding: 0.6rem 1.2rem; font-size: 0.7rem;"
							onclick={() => isModalOpen = true}
						>
							+ Assign Product
						</button>
					</div>

					<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
						{#each data.category.products as product}
							<div class="product-mini-card">
								<div class="mini-card-image">
									{#if product.images[0]}
										<img src={getImageUrl(product.images[0])} alt="" />
									{/if}
								</div>
								<div class="mini-card-info">
									<div class="mini-name">{product.name}</div>
									<div class="mini-meta">Rp {Number(product.price < 10000 ? product.price * 1000 : product.price).toLocaleString()}</div>
								</div>
							</div>
						{/each}
						
						{#if data.category.products.length === 0}
							<div style="grid-column: span 3; padding: 4rem; text-align: center; background: #fdfdfd; border: 2px dashed #f0f0f0; border-radius: 1.5rem; color: #ccc; font-weight: 700; font-size: 0.8rem;">
								No products assigned to this collection.
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="form-sidebar-section">
				<div class="input-group">
					<UploadImage 
						bucket="products" 
						folder="categories" 
						initialImage={imageUrl}
						onUpload={(url) => imageUrl = url} 
					/>
					<input type="hidden" name="image" value={imageUrl} />
				</div>

				<div style="margin-top: 4rem; display: flex; flex-direction: column; gap: 1rem;">
					<button type="submit" class="btn-studio">
						Save Changes
					</button>
					<button 
						type="submit" 
						formaction="?/delete" 
						class="btn-studio-secondary" 
						style="color: #ff4d4d; border-color: #ffeded;"
						onclick={(e) => { if (!confirm('Are you sure you want to delete this collection?')) e.preventDefault(); }}
					>
						Delete Collection
					</button>
					<a href="/categories" class="btn-studio-secondary" style="text-align: center;">
						Back to Archive
					</a>
				</div>
			</div>
		</div>
	</form>
</div>

<!-- Assignment Modal -->
{#if isModalOpen}
	<div 
		class="modal-overlay" 
		onclick={() => isModalOpen = false} 
		onkeydown={(e) => { if (e.key === 'Escape') isModalOpen = false; }}
		role="button"
		tabindex="0"
	>
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">

			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
				<h2 style="font-size: 1.5rem; font-weight: 900; margin: 0; letter-spacing: -0.04em;">Assign to Collection</h2>
				<button class="close-btn" onclick={() => isModalOpen = false}>✕</button>
			</div>

			<input 
				type="text" 
				placeholder="Filter products..." 
				class="input-control" 
				style="margin-bottom: 2rem; background: #f8f8f8; border: none; padding: 1rem 1.5rem;"
				bind:value={searchQuery}
			/>

			<div class="modal-grid">
				{#each filteredProducts as product}
					<form method="POST" action="?/assignProduct" use:enhance={() => { isModalOpen = false; return async ({ update }) => { await update(); }; }}>
						<input type="hidden" name="productId" value={product.id} />
						<button type="submit" class="assignment-card">
							<div class="assignment-image">
								{#if product.images[0]}
									<img src={getImageUrl(product.images[0])} alt="" />
								{/if}
							</div>
							<div style="text-align: left; padding: 1rem;">
								<div style="font-weight: 800; font-size: 0.8rem;">{product.name}</div>
								<div style="font-size: 0.65rem; color: #aaa; margin-top: 0.2rem; font-weight: 700;">Currently in: {product.category?.name}</div>
							</div>
						</button>
					</form>
				{/each}
			</div>

			{#if filteredProducts.length === 0}
				<div style="text-align: center; padding: 4rem 0; color: #ccc; font-weight: 700;">No products found to assign.</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.product-mini-card {
		background: #fff;
		border: 1px solid #f0f0f0;
		border-radius: 1.2rem;
		overflow: hidden;
		transition: transform 0.3s ease;
	}
	.product-mini-card:hover { transform: scale(1.02); }
	.mini-card-image { height: 180px; background: #f8f8f8; }
	.mini-card-image img { width: 100%; height: 100%; object-fit: cover; }
	.mini-card-info { padding: 1.2rem; }
	.mini-name { font-weight: 800; font-size: 0.85rem; }
	.mini-meta { font-size: 0.75rem; color: #10b981; font-weight: 700; margin-top: 0.3rem; }

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.4);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}
	.modal-content {
		background: #fff;
		width: 100%;
		max-width: 900px;
		max-height: 80vh;
		border-radius: 2rem;
		padding: 3rem;
		overflow-y: auto;
		box-shadow: 0 40px 100px rgba(0,0,0,0.15);
	}
	.modal-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem;
	}
	.assignment-card {
		background: none;
		border: 1px solid #f0f0f0;
		padding: 0;
		border-radius: 1rem;
		overflow: hidden;
		cursor: pointer;
		width: 100%;
		transition: all 0.3s ease;
	}
	.assignment-card:hover { border-color: #000; transform: translateY(-5px); }
	.assignment-image { height: 150px; background: #f8f8f8; }
	.assignment-image img { width: 100%; height: 100%; object-fit: cover; }
	
	.close-btn { background: #f5f5f5; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-weight: 900; }
</style>
