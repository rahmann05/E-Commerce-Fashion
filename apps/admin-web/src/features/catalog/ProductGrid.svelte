<script lang="ts">
  import { env } from '$env/dynamic/public';

  let { products } = $props<{ products: any[] }>();

  function formatCurrency(amount: number) {
    const finalAmount = amount < 10000 ? amount * 1000 : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(finalAmount);
  }

  function getImageUrl(url: string) {
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

<div class="entry-grid">
  {#each products as product}
    <a href="/products/{product.id}" class="product-entry">
      <div class="entry-image">
        {#if (product.image && product.image.length > 0) || (product.images && product.images.length > 0)}
          {@const displayImage = product.image?.[0] || product.images?.[0]}
          <img src={getImageUrl(displayImage)} alt={product.name} />
        {:else}
          <div class="image-placeholder">
            {product.name.charAt(0)}
          </div>
        {/if}
      </div>

      <div class="entry-info">
        <div class="info-main">
          <div class="entry-name">{product.name}</div>
          <div class="entry-meta">{product.category?.name || 'ESSENTIAL'} · {product.stock} IN STOCK</div>
        </div>
        <div class="entry-price">{formatCurrency(product.price)}</div>
      </div>
    </a>
  {:else}
    <div class="empty-archive">
      <h2>Empty Archive</h2>
    </div>
  {/each}
</div>

<style>
  .entry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2.5rem;
  }

  .product-entry {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .entry-image {
    width: 100%;
    aspect-ratio: 4/5;
    background: #f7f7f7;
    border-radius: 0.8rem;
    overflow: hidden;
    position: relative;
  }

  .entry-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .product-entry:hover .entry-image img {
    transform: scale(1.05);
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    opacity: 0.1;
    font-weight: 900;
    background: #f0f0f0;
  }

  .entry-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .info-main {
    flex: 1;
    min-width: 0;
    padding-right: 1rem;
  }

  .entry-name {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-meta {
    font-size: 0.7rem;
    font-weight: 700;
    color: #bbb;
    text-transform: uppercase;
    margin-top: 0.4rem;
    letter-spacing: 0.05em;
  }

  .entry-price {
    font-weight: 800;
    font-size: 0.9rem;
  }

  .empty-archive {
    grid-column: 1 / -1;
    text-align: center;
    padding: 10rem 0;
    opacity: 0.1;
  }

  .empty-archive h2 {
    font-size: 4rem;
    font-weight: 900;
    letter-spacing: -0.05em;
  }
</style>
