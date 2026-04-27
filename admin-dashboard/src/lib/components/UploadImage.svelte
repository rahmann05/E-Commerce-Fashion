<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let bucket = 'products';
	export let folder = 'images';
	export let label = 'Upload Image';

	let uploading = false;
	let previewUrl = '';
	let fileInput: HTMLInputElement;

	async function handleUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			uploading = true;
			
			// Show local preview
			previewUrl = URL.createObjectURL(file);

			const fileExt = file.name.split('.').pop();
			const fileName = `${Math.random()}.${fileExt}`;
			const filePath = `${folder}/${fileName}`;

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(filePath, file);

			if (error) throw error;

			const { data: { publicUrl } } = supabase.storage
				.from(bucket)
				.getPublicUrl(filePath);

			dispatch('upload', { url: publicUrl });
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Error uploading image. Make sure the bucket exists and is public.');
		} finally {
			uploading = false;
		}
	}
</script>

<div class="upload-editorial">
	<span class="input-label">{label}</span>
	
	<div class="preview-container" class:has-image={!!previewUrl}>
		{#if previewUrl}
			<img src={previewUrl} alt="Preview" />
		{:else}
			<div class="upload-placeholder">
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
				<p>Select visual asset</p>
			</div>
		{/if}
		
		<button 
			type="button" 
			class="trigger-btn" 
			on:click={() => fileInput.click()}
			disabled={uploading}
		>
			{uploading ? 'Processing...' : 'Choose File'}
		</button>
	</div>

	<input
		type="file"
		accept="image/*"
		bind:this={fileInput}
		on:change={handleUpload}
		hidden
	/>
</div>

<style>
	.upload-editorial {
		display: flex;
		flex-direction: column;
	}

	.preview-container {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		background: #fff;
		border-radius: 2.5rem;
		border: 1px solid rgba(0,0,0,0.05);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: all 0.5s ease;
	}

	.preview-container.has-image {
		border-color: transparent;
	}

	.preview-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.upload-placeholder {
		text-align: center;
		color: #ccc;
	}

	.upload-placeholder p {
		margin-top: 1rem;
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.trigger-btn {
		position: absolute;
		bottom: 2rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		color: #111;
		padding: 0.8rem 2rem;
		border-radius: 999px;
		font-weight: 800;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border: 1px solid rgba(0,0,0,0.05);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.trigger-btn:hover {
		background: #fff;
		transform: scale(1.05);
		box-shadow: 0 10px 20px rgba(0,0,0,0.05);
	}
</style>
