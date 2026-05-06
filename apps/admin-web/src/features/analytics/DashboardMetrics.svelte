<script lang="ts">
  import InsightCard from '@components/molecules/InsightCard.svelte';
  
  let { analytics } = $props<{ analytics: any }>();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
</script>

<div class="metrics-grid">
  <InsightCard 
    label="Gross Transaction Value (Life)"
    value={formatCurrency(analytics.summary.totalRevenue)}
    trend={analytics.summary.revenueGrowth >= 0 ? 'up' : 'down'}
    trendValue={Math.abs(analytics.summary.revenueGrowth)}
  />
  
  <InsightCard 
    label="Net Settlement (Est)"
    value={formatCurrency(analytics.finance.grossProfit)}
    description="Clearing tomorrow at 08:00 AM"
  />

  <div class="insight-card">
    <div class="insight-label">Payment Success Rate</div>
    <div class="insight-value">{analytics.successRate || 100}%</div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: {analytics.successRate || 100}%"></div>
    </div>
  </div>
</div>

<style>
  .metrics-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .insight-card {
    background: #fff;
    padding: 2rem 2.5rem;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
  }

  .insight-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  .insight-value {
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .progress-bar-container {
    width: 100%;
    height: 4px;
    background: #eee;
    border-radius: 2px;
    margin-top: 1.5rem;
  }

  .progress-bar-fill {
    height: 100%;
    background: #000;
    border-radius: 2px;
  }
</style>
