<script lang="ts">
  let { finance, revenueThisMonth } = $props<{ finance: any, revenueThisMonth: number }>();

  function formatCurrency(amount: number) {
    const final = amount < 10000 ? amount * 1000 : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(final);
  }
</script>

<div class="finance-section">
  <h2 class="section-title">Financial Performance Audit</h2>
  <div class="audit-grid">
    <div class="insight-card featured">
      <div class="header">
        <div class="content">
          <div class="meta-label">Estimated Net Profit</div>
          <div class="main-amount">{formatCurrency(finance.grossProfit)}</div>
          <div class="margin-info">Operating Margin: {finance.margin}%</div>
        </div>
        <div class="icon-circle">$</div>
      </div>
    </div>

    <div class="insight-card">
      <div class="meta-label">Cost of Goods (COGS)</div>
      <div class="secondary-amount">{formatCurrency(finance.estimatedCOGS)}</div>
      <div class="footer-info">Based on 35% fixed overhead</div>
    </div>

    <div class="insight-card">
      <div class="meta-label">Tax Liability (Est)</div>
      <div class="secondary-amount">{formatCurrency(revenueThisMonth * 0.11)}</div>
      <div class="footer-info">VAT 11% Baseline</div>
    </div>
  </div>
</div>

<style>
  .finance-section {
    margin-bottom: 5rem;
  }

  .section-title {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #ccc;
    margin-bottom: 3rem;
  }

  .audit-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 3rem;
  }

  .insight-card {
    background: #fff;
    padding: 2.5rem;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
  }

  .insight-card.featured {
    padding: 3rem;
    background: #fdfdfd;
    border-color: #f0f0f0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .meta-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #aaa;
    margin-bottom: 1rem;
  }

  .main-amount {
    font-size: 2.8rem;
    font-weight: 900;
    letter-spacing: -0.05em;
  }

  .margin-info {
    font-size: 0.75rem;
    font-weight: 800;
    color: #10b981;
    margin-top: 1rem;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
    background: #f0fdf4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10b981;
    font-weight: 900;
  }

  .secondary-amount {
    font-size: 1.5rem;
    font-weight: 800;
  }

  .footer-info {
    font-size: 0.7rem;
    color: #aaa;
    font-weight: 600;
    margin-top: 0.5rem;
  }
</style>
