<script lang="ts">
  import DashboardMetrics from '@features/analytics/DashboardMetrics.svelte';
  import RecentTransactions from '@features/order/RecentTransactions.svelte';
  
  let { data } = $props();
</script>

<div class="hero-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
  <div>
    <h1 class="editorial-title">Business Overview</h1>
    <p class="editorial-subtitle">Real-time transaction and settlement metrics.</p>
  </div>
</div>

<DashboardMetrics analytics={data.analytics} />

<RecentTransactions orders={data.recentOrders} />
