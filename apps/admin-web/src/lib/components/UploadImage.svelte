<script lang="ts">
  import { supabase } from '$lib/supabase';
  
  let { 
    bucket = 'products', 
    folder = 'images', 
    label = 'Upload Image', 
    initialImage = '',
    onUpload 
  } = $props<{
    bucket?: string;
    folder?: string;
    label?: string;
    initialImage?: string;
    onUpload: (url: string) => void;
  }>();

  let uploading = $state(false);
  let previewUrl = $state(initialImage);
  let fileInput: HTMLInputElement;

  async function handleUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      uploading = true;
      previewUrl = URL.createObjectURL(file); // Local preview

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Check if bucket exists and is public.');
    } finally {
      uploading = false;
    }
  }
</script>

<div class="upload-editorial">
  <span class="input-label" style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">{label}</span>
  
  <div class="preview-container" style="position: relative; width: 100%; aspect-ratio: 16/9; background: #fafafa; border-radius: 1.2rem; border: 1.5px dashed #eee; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
    {#if previewUrl}
      <img src={previewUrl} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
    {:else}
      <div class="upload-placeholder" style="text-align: center; color: #ccc;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <p style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-top: 0.5rem;">Upload Image</p>
      </div>
    {/if}
    
    <button 
      type="button" 
      onclick={() => fileInput.click()}
      disabled={uploading}
      style="position: absolute; background: #fff; border: 1px solid #eee; padding: 0.5rem 1.2rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"
    >
      {uploading ? 'Uploading...' : 'Choose File'}
    </button>
  </div>

  <input
    type="file"
    accept="image/*"
    bind:this={fileInput}
    onchange={handleUpload}
    hidden
  />
</div>
