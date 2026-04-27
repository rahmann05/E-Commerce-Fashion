<script lang="ts">
	let { data } = $props();
	import { enhance } from '$app/forms';

	function getImageUrl(url: string) {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		
		const SUPABASE_STORAGE_URL = 'https://ghdadhlyhzdkrjlurifj.supabase.co/storage/v1/object/public';
		const BUCKET_NAME = 'product';
		
		let cleanPath = url.startsWith('/') ? url.slice(1) : url;
		if (cleanPath.startsWith('images/')) {
			cleanPath = cleanPath.replace('images/', '');
		}
		return `${SUPABASE_STORAGE_URL}/${BUCKET_NAME}/${cleanPath}`;
	}
</script>

<div class="hero-header">
	<h1 class="editorial-title">Refine Entry</h1>
	<p class="editorial-subtitle">Adjusting the essence of {data.product.name}.</p>
</div>

<div class="form-card">
	<form method="POST" action="?/update" use:enhance>
		<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;">
			<div class="form-main-section">
				<div class="input-group">
					<label class="input-label" for="name">Product Name</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						class="input-control" 
						value={data.product.name}
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
					>{data.product.description}</textarea>
				</div>

				<div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
					<div class="input-group">
						<label class="input-label" for="price">Price (IDR)</label>
						<input 
							type="number" 
							id="price" 
							name="price" 
							class="input-control" 
							value={data.product.price}
							required 
						/>
					</div>
					
					<!-- Size-Based Inventory -->
					<div class="input-group">
						<div class="input-label">Size-Based Inventory</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
							{#each data.product.sizeOptions as size, i}
								<div style="display: flex; align-items: center; gap: 1rem; background: #fdfdfd; padding: 0.8rem 1.2rem; border-radius: 1rem; border: 1px solid #f0f0f0;">
									<span style="font-weight: 800; font-size: 0.85rem; width: 30px;">{size}</span>
									<input 
										type="number" 
										name="sizeStocks" 
										class="input-control" 
										style="padding: 0.5rem; text-align: center;"
										value={data.product.sizeStocks[i] || 0}
									/>
									<input type="hidden" name="sizeOptions" value={size} />
								</div>
							{/each}
						</div>
					</div>
				</div>

			</div>

			<div class="form-sidebar-section">
				<div class="input-group">
					<label class="input-label" for="category">Category</label>
					<select id="category" name="categoryId" class="input-control" required>
						{#each data.categories as category}
							<option value={category.id} selected={data.product.categoryId === category.id}>
								{category.name}
							</option>
						{/each}
					</select>
				</div>

				<div class="input-group">
					<div class="input-label">Product Status</div>

					<div style="display: flex; gap: 1rem; margin-top: 1rem;">
						<label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600;">
							<input type="checkbox" name="inStock" checked={data.product.inStock} style="width: 18px; height: 18px; accent-color: #000;" />
							Active in Store
						</label>
					</div>
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
						onclick={(e) => { if (!confirm('Are you sure you want to delete this product?')) e.preventDefault(); }}
					>
						Delete Entry
					</button>
					<a href="/products" class="btn-studio-secondary" style="text-align: center;">
						Back to Catalogue
					</a>
				</div>
			</div>
		</div>
	</form>
</div>
