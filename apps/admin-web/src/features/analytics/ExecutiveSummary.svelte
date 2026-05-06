<script lang="ts">
  let { summary } = $props<{ summary: any }>();

  function formatCurrency(amount: number) {
    const final = amount < 10000 ? amount * 1000 : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(final);
  }
</script>

<div class="summary-grid">
  <div class="insight-card-premium">
    <div class="meta-label">Revenue This Month</div>
    <div class="main-val">{formatCurrency(summary.revenueThisMonth)}</div>
    <div class="trend-indicator {Number(summary.revenueGrowth) >= 0 ? 'up' : 'down'}">
      {Number(summary.revenueGrowth) >= 0 ? '+' : ''}{summary.revenueGrowth}% vs prev month
    </div>
  </div>
  
  <div class="insight-card-premium">
    <div class="meta-label">Avg Order Value</div>
    <div class="main-val">{formatCurrency(summary.aov)}</div>
    <div class="sub-label">Verified baseline</div>
  </div>

  <div class="insight-card-premium">
    <div class="meta-label">New Customers</div>
    <div class="main-val">{summary.newCustomers}</div>
    <div class="sub-label">Joined this period</div>
  </div>

  <div class="insight-card-premium dark">
    <div class="meta-label fiscal">Fiscal Capacity</div>
    <div class="main-val light">{formatCurrency(summary.totalRevenue)}</div>
    <div class="sub-label fiscal">Lifetime gross</div>
  </div>
</div>

<style>
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
    margin-bottom: 5rem;
  }

  .insight-card-premium {
    background: #fff;
    border: 1px solid #f0f0f0;
    padding: 2.5rem;
    border-radius: 1.5rem;
    transition: transform 0.4s ease;
  }

  .insight-card-premium:hover {
    transform: translateY(-5px);
  }

  .insight-card-premium.dark {
    background: #111;
    border: none;
  }

  .meta-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #aaa;
    margin-bottom: 1.5rem;
  }

  .meta-label.fiscal {
    color: #666;
  }

  .main-val {
    font-size: 2.2rem;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .main-val.light {
    color: #fff;
  }

  .sub-label {
    font-size: 0.75rem;
    color: #ccc;
    font-weight: 700;
    margin-top: 0.8rem;
  }

  .sub-label.fiscal {
    color: #444;
  }

  .trend-indicator {
    font-size: 0.75rem;
    font-weight: 800;
    margin-top: 1rem;
  }

  .trend-indicator.up {
    color: #10b981;
  }

  .trend-indicator.down {
    color: #ff4d4d;
  }
</style>
