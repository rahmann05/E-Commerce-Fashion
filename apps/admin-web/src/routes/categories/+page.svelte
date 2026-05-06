<script lang="ts">
	import CategoryCard from '@features/catalog/CategoryCard.svelte';
	let { data } = $props();
</script>

<div class="hero-header">
	<div style="display: flex; justify-content: space-between; align-items: flex-end;">
		<div>
			<h1 class="editorial-title">Collections</h1>
			<p class="editorial-subtitle" style="margin-top: 1rem;">Architecting the brand structure through refined groupings.</p>
		</div>
		<a href="/categories/new" class="btn-studio">
			+ New Collection
		</a>
	</div>
</div>

<div class="collection-grid">
	{#each data.categories as category}
		<CategoryCard {category} />
	{:else}
		<div class="empty-archive">
			<h2>Empty Archive</h2>
		</div>
	{/each}
</div>

<style>
  .collection-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    margin-top: 2rem;
  }

  .empty-archive {
    grid-column: 1 / -1;
    text-align: center;
    padding: 10rem 0;
    opacity: 0.2;
  }

  .empty-archive h2 {
    font-size: 3rem;
    font-weight: 800;
  }
</style>
