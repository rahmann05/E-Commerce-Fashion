<script lang="ts">
  let { data } = $props();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStatusClass(status: string) {
    if (['SHIPPED', 'DELIVERED'].includes(status)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'cancelled';
    return 'pending';
  }
</script>

<div class="hero-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
  <div>
    <h1 class="editorial-title">Business Overview</h1>
    <p class="editorial-subtitle">Real-time transaction and settlement metrics.</p>
  </div>
  <button class="btn-studio">Download Report</button>
</div>

<!-- Metrics -->
<div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Gross Transaction Value (Life)</div>
    <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em;">{formatCurrency(data.analytics.summary.totalRevenue)}</div>
    <div style="margin-top: 1rem; font-size: 0.8rem; font-weight: 600; color: #15803d; display: flex; align-items: center; gap: 0.5rem;">
      <span style="background: #dcfce7; padding: 0.2rem 0.5rem; border-radius: 4px;">{data.analytics.summary.revenueGrowth >= 0 ? '↑' : '↓'} {data.analytics.summary.revenueGrowth}%</span> vs last month
    </div>
  </div>
  
  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Net Settlement (Est)</div>
    <div style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">{formatCurrency(data.analytics.finance.grossProfit)}</div>
    <div style="margin-top: 1rem; font-size: 0.8rem; font-weight: 500; color: #888;">Clearing tomorrow at 08:00 AM</div>
  </div>

  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Payment Success Rate</div>
    <div style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">{data.analytics.successRate || 100}%</div>
    <div style="width: 100%; height: 4px; background: #eee; border-radius: 2px; margin-top: 1.5rem;">
      <div style="width: {data.analytics.successRate || 100}%; height: 100%; background: #000; border-radius: 2px;"></div>
    </div>
  </div>
</div>

<!-- Transactions Table -->
<div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; overflow: hidden;">
  <div style="padding: 2rem 2.5rem; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
    <h2 style="font-size: 1.2rem; font-weight: 800; margin: 0;">Recent Transactions</h2>
    <a href="/orders" class="btn-studio-secondary" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">View All</a>
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
      {#each data.recentOrders as order}
        <tr style="border-top: 1px solid #f9f9f9; cursor: pointer;" onclick={() => goto(`/orders/${order.id}`)}>
          <td style="padding: 1.5rem 2.5rem;">
            <div style="font-weight: 700;">#{order.id.slice(-6).toUpperCase()}</div>
            <div style="font-size: 0.75rem; color: #888; margin-top: 0.3rem;">{new Date(order.createdAt).toLocaleDateString()}</div>
          </td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 500;">{order.customer?.name || 'Guest'}</td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 800; text-align: right;">{formatCurrency(order.totalAmount)}</td>
          <td style="padding: 1.5rem 2.5rem;">
            <span class="status-pill {getStatusClass(order.status)}">{order.status.replace('_', ' ')}</span>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" style="text-align: center; padding: 3rem; color: #888; font-weight: 500;">No recent transactions found.</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>