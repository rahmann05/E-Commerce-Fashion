<script lang="ts">
  import OrderTable from '@features/order/OrderTable.svelte';
  
  let { data } = $props();
  let searchQuery = $state('');
  let activeTab = $state('ALL');

  const tabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'AWAITING_PAYMENT', label: 'Unpaid' },
    { id: 'PROCESSING', label: 'To Process' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'DELIVERED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled/Returned' }
  ];

  let filteredOrders = $derived(
    data.orders.filter((o: any) => {
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'CANCELLED') {
         matchesTab = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(o.status);
      } else if (activeTab !== 'ALL') {
         matchesTab = o.status === activeTab;
      }
      return matchesSearch && matchesTab;
    })
  );
</script>

<div class="hero-header" style="margin-bottom: 2rem;">
  <h1 class="editorial-title">Transactions</h1>
  <p class="editorial-subtitle">Complete history of all payments and orders.</p>
</div>

<div class="tabs-container" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; overflow-x: auto; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">
  {#each tabs as tab}
    <button 
      class="tab-btn" 
      class:active={activeTab === tab.id}
      onclick={() => activeTab = tab.id}
      style="background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; font-family: inherit; font-weight: {activeTab === tab.id ? '700' : '500'}; color: {activeTab === tab.id ? '#000' : '#888'}; border-bottom: {activeTab === tab.id ? '2px solid #000' : '2px solid transparent'}; transition: all 0.2s;"
    >
      {tab.label}
    </button>
  {/each}
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
