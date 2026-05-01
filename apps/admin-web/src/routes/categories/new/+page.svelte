<script lang="ts">
	import { enhance } from '$app/forms';
	import UploadImage from '$lib/components/UploadImage.svelte';
	
	let imageUrl = $state('');
</script>

<div class="hero-header">
	<h1 class="editorial-title">New Collection</h1>
	<p class="editorial-subtitle">Defining a new conceptual group for your catalogue.</p>
</div>

<div class="form-card">
	<form method="POST" use:enhance>
		<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem;">
			<div class="form-main-section">
				<div class="input-group">
					<label class="input-label" for="name">Collection Name</label>
					<input 
						type="text" 
						id="name" 
						name="name" 
						class="input-control" 
						placeholder="e.g. Summer Essentials"
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
						placeholder="Describe the essence of this collection..."
						required
					></textarea>
				</div>
			</div>

			<div class="form-sidebar-section">
				<div class="input-group">
					<UploadImage 
						bucket="products" 
						folder="categories" 
						onUpload={(url) => imageUrl = url} 
					/>
					<input type="hidden" name="image" value={imageUrl} />
				</div>

				<div style="margin-top: 4rem; display: flex; flex-direction: column; gap: 1rem;">
					<button type="submit" class="btn-studio">
						Create Collection
					</button>
					<a href="/categories" class="btn-studio-secondary" style="text-align: center;">
						Discard
					</a>
				</div>
			</div>
		</div>
	</form>
</div>
