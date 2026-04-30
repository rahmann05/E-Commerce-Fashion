<script lang="ts">
	import { enhance } from '$app/forms';
	
	let imageUrl = $state('');

	function getImageUrl(url: string | null) {
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
					<label class="input-label" for="image">Cover Image Path/URL</label>
					<input 
						type="text" 
						id="image" 
						name="image" 
						class="input-control" 
						bind:value={imageUrl}
						placeholder="/images/collection1.png"
					/>
					<p style="font-size: 0.7rem; color: #aaa; margin-top: 0.5rem; font-weight: 600;">Use relative paths (e.g. /images/...) for Supabase or absolute URLs.</p>
				</div>

				<!-- Preview Card -->
				<div style="margin-top: 2rem; padding: 1rem; background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 1rem;">
					<div style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #ccc; margin-bottom: 1rem;">Visual Preview</div>
					<div style="width: 100%; height: 200px; background: #f8f8f8; border-radius: 0.5rem; overflow: hidden;">
						{#if imageUrl}
							<img src={getImageUrl(imageUrl)} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
						{:else}
							<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #eee; font-size: 2rem;">IMAGE</div>
						{/if}
					</div>
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
