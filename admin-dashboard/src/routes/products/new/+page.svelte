<script lang="ts">
	let { data } = $props();
	import { enhance } from '$app/forms';

	let imageUrl = $state('');

	const sizes = ['S', 'M', 'L', 'XL'];
</script>

<div class="hero-header">
	<h1 class="editorial-title">New Entry</h1>
	<p class="editorial-subtitle">Add a new essential to the collection.</p>
</div>

<div class="form-card">
	<form method="POST" use:enhance>
		<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;">
			<div class="form-main-section">
				<div class="input-group">
					<label class="input-label" for="name">Product Name</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						class="input-control" 
						placeholder="e.g. Essential Boxy Tee"
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
						placeholder="Describe the silhouette and material..."
						required
					></textarea>
				</div>

				<div style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
					<div class="input-group">
						<label class="input-label" for="price">Price (IDR)</label>
						<input 
							type="number" 
							id="price" 
							name="price" 
							class="input-control" 
							placeholder="250000"
							required 
						/>
					</div>
					
					<!-- Size-Based Inventory -->
					<div class="input-group">
						<div class="input-label">Initial Size-Based Inventory</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
							{#each sizes as size}
								<div style="display: flex; align-items: center; gap: 1rem; background: #fdfdfd; padding: 0.8rem 1.2rem; border-radius: 1rem; border: 1px solid #f0f0f0;">
									<span style="font-weight: 800; font-size: 0.85rem; width: 30px;">{size}</span>
									<input 
										type="number" 
										name="sizeStocks" 
										class="input-control" 
										style="padding: 0.5rem; text-align: center;"
										value="0"
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
						<option value="" disabled selected>Select Category</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="input-group">
					<label class="input-label" for="imageUrl">Image URL</label>
					<input 
						type="text" 
						id="imageUrl" 
						name="imageUrl" 
						class="input-control" 
						placeholder="/images/product-name.png"
						bind:value={imageUrl}
					/>
					{#if imageUrl}
						<div style="margin-top: 1rem; width: 100%; aspect-ratio: 4/5; background: #f8f8f8; border-radius: 1rem; overflow: hidden; border: 1px solid #f0f0f0;">
							<img src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
						</div>
					{/if}
				</div>

				<div style="margin-top: 4rem; display: flex; flex-direction: column; gap: 1rem;">
					<button type="submit" class="btn-studio">
						Create Entry
					</button>
					<a href="/products" class="btn-studio-secondary" style="text-align: center;">
						Discard Changes
					</a>
				</div>
			</div>
		</div>
	</form>
</div>
