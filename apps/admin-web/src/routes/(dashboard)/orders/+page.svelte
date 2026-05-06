<script lang="ts">
  import OrderTable from '@features/order/OrderTable.svelte';
  
  let { data } = $props();
  let searchQuery = $state('');

  let filteredOrders = $derived(
    data.orders.filter((o: any) => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="hero-header" style="margin-bottom: 2rem;">
  <h1 class="editorial-title">Transactions</h1>
  <p class="editorial-subtitle">Complete history of all payments and orders.</p>
</div>

<div class="filter-section" style="margin-bottom: 2rem;">
  <input 
    type="text" 
    bind:value={searchQuery} 
    placeholder="Search Order ID or Customer Name..." 
    style="padding: 0.8rem 1.5rem; border-radius: 999px; border: 1px solid #eee; background: #fafafa; font-size: 0.9rem; width: 100%; max-width: 500px; font-family: inherit;" 
  />
</div>

<OrderTable orders={filteredOrders} />
