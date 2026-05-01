<script lang="ts">
  import { goto } from '$app/navigation';
  let { data } = $props();
  let searchQuery = $state('');

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStatusClass(status: string) {
    if (['SHIPPED', 'DELIVERED'].includes(status)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'cancelled';
    return 'pending';
  }

  let filteredOrders = $derived(
    data.orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="hero-header" style="margin-bottom: 2rem;">
  <h1 class="editorial-title">Transactions</h1>
  <p class="editorial-subtitle">Complete history of all payments and orders.</p>
</div>

<div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; overflow: hidden;">
  <div style="padding: 2rem 2.5rem; border-bottom: 1px solid #f0f0f0; display: flex; gap: 1rem;">
    <input type="text" bind:value={searchQuery} placeholder="Search Order ID or Customer Name..." style="padding: 0.8rem 1.5rem; border-radius: 999px; border: 1px solid #eee; background: #fafafa; font-size: 0.9rem; flex: 1; font-family: inherit;" />
  </div>
  
  <table style="width: 100%; text-align: left; border-collapse: collapse;">
    <thead>
      <tr style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em;">
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Order ID</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Customer</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700; text-align: right;">Gross Amount</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Status</th>
      </tr>
    </thead>
    <tbody style="font-size: 0.9rem;">
      {#each filteredOrders as order}
        <tr style="border-top: 1px solid #f9f9f9; cursor: pointer; transition: background 0.2s;" onmouseover={e => e.currentTarget.style.background='#fcfcfc'} onmouseout={e => e.currentTarget.style.background='transparent'} onclick={() => goto(`/orders/${order.id}`)}>
          <td style="padding: 1.5rem 2.5rem;">
            <div style="font-weight: 700;">#{order.id.slice(-6).toUpperCase()}</div>
            <div style="font-size: 0.75rem; color: #888; margin-top: 0.3rem;">{new Date(order.createdAt).toLocaleString()}</div>
          </td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 500;">{order.customer?.name || 'Guest'}</td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 800; text-align: right;">{formatCurrency(order.totalAmount)}</td>
          <td style="padding: 1.5rem 2.5rem;">
            <span class="status-pill {getStatusClass(order.status)}">{order.status.replace('_', ' ')}</span>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" style="padding: 3rem; text-align: center; color: #888; font-weight: 500;">No transactions found.</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
