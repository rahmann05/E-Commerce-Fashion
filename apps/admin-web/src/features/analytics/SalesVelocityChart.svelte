<script lang="ts">
  let { dailyData } = $props<{ dailyData: number[] }>();
  
  const maxVal = $derived(Math.max(...dailyData));
</script>

<div class="chart-card">
  <div class="header">
    <h3 class="title">Sales Velocity (30D)</h3>
    <p class="subtitle">Daily revenue tracking with rolling volatility</p>
  </div>

  <div class="chart-area">
    {#each dailyData as val}
      <div 
        class="chart-bar-minimal" 
        style="height: {val > 0 ? Math.max((val / maxVal) * 100, 5) : 2}%;"
        title={val.toString()}
      ></div>
    {/each}
  </div>
  <div class="chart-footer">
    <span>30 Days Ago</span>
    <span>Today</span>
  </div>
</div>

<style>
  .chart-card {
    background: #fff;
    border-radius: 1.2rem;
    border: 1px solid #f0f0f0;
    padding: 3.5rem;
  }

  .header {
    margin-bottom: 4rem;
  }

  .title {
    font-size: 1.2rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 0.8rem;
    color: #888;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .chart-area {
    height: 350px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }

  .chart-bar-minimal {
    flex: 1;
    background: #f5f5f5;
    border-radius: 2px 2px 0 0;
    transition: background 0.3s;
  }

  .chart-bar-minimal:hover {
    background: #000;
  }

  .chart-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    color: #ccc;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
</style>
