<script lang="ts">
  let { label, value, trend, trendValue, description } = $props<{
    label: string;
    value: string;
    trend?: 'up' | 'down';
    trendValue?: number | string;
    description?: string;
  }>();
</script>

<div class="insight-card">
  <div class="insight-label">{label}</div>
  <div class="insight-value">{value}</div>
  
  {#if trend && trendValue}
    <div class="insight-trend" class:up={trend === 'up'} class:down={trend === 'down'}>
      <span class="trend-badge">{trend === 'up' ? '↑' : '↓'} {trendValue}%</span> vs last month
    </div>
  {/if}

  {#if description}
    <div class="insight-description">{description}</div>
  {/if}
</div>

<style>
  .insight-card {
    background: #fff;
    padding: 2rem 2.5rem;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .insight-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.03);
    border-color: #e0e0e0;
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
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #111;
  }

  .insight-trend {
    margin-top: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #888;
  }

  .insight-trend.up .trend-badge {
    background: #dcfce7;
    color: #15803d;
  }

  .insight-trend.down .trend-badge {
    background: #fee2e2;
    color: #b91c1c;
  }

  .trend-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .insight-description {
    margin-top: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #888;
  }
</style>
