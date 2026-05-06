<script lang="ts">
  let { categories, currentCategory, query } = $props<{
    categories: any[];
    currentCategory: string | null;
    query: string;
  }>();
</script>

<div class="segmentation-nav">
  <a 
    href="/products{query ? `?q=${query}` : ''}" 
    class="nav-item"
    class:active={!currentCategory}
  >
    All Collections
  </a>
  {#each categories as cat}
    <a 
      href="/products?category={cat.id}{query ? `&q=${query}` : ''}" 
      class="nav-item"
      class:active={currentCategory === cat.id}
    >
      {cat.name}
    </a>
  {/each}
</div>

<style>
  .segmentation-nav {
    display: flex;
    gap: 3rem;
    margin-top: 4rem;
    padding-bottom: 1rem;
    overflow-x: auto;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-item {
    font-size: 0.75rem;
    font-weight: 700;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #bbb;
    padding-bottom: 1.5rem;
    white-space: nowrap;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
  }

  .nav-item:hover {
    color: #111;
  }

  .nav-item.active {
    color: #111;
    border-bottom-color: #111;
  }
</style>
