<script lang="ts">
  import { env } from '$env/dynamic/public';
  
  let { category } = $props<{ category: any }>();
  
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

  const displayImage = $derived(category.image || (category.products?.[0]?.images?.[0] || null));
</script>

<a href="/categories/{category.id}" class="collection-card">
  <div class="card-visual">
    {#if displayImage}
      <img src={getImageUrl(displayImage)} alt={category.name} />
    {:else}
      <div class="image-placeholder">
        {category.name.charAt(0)}
      </div>
    {/if}
    <div class="visual-overlay">
      <div class="product-count">{category._count.products} Products</div>
      <div class="category-name">{category.name}</div>
    </div>
  </div>
  <div class="card-content">
    <p class="description">
      {category.description || 'Essential items curated for the modern wardrobe. Defined by quality, purpose, and timeless aesthetic.'}
    </p>
    <div class="manage-link">
      Manage Structure <span>→</span>
    </div>
  </div>
</a>

<style>
  .collection-card {
    background: #fff;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
    padding: 0;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  }

  .collection-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 40px 80px rgba(0,0,0,0.08);
    border-color: #e0e0e0;
  }

  .card-visual {
    height: 350px;
    background: #f8f8f8;
    position: relative;
    overflow: hidden;
  }

  .card-visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .collection-card:hover .card-visual img {
    transform: scale(1.05);
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    opacity: 0.05;
    font-weight: 900;
  }

  .visual-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 3rem;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
    color: #fff;
  }

  .product-count {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  .category-name {
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .card-content {
    padding: 2.5rem;
  }

  .description {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }

  .manage-link {
    margin-top: 2rem;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #111;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
