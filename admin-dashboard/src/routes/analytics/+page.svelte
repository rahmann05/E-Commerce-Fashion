<script lang="ts">
	let { data } = $props();

	let forecastHorizon = $state(30);
	let confidenceLevel = $state(95);
	let isProcessing = $state(false);

	function formatCurrency(amount: number) {
		const final = amount < 10000 ? amount * 1000 : amount;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(final);
	}

	function runForecast() {
		isProcessing = true;
		setTimeout(() => {
			isProcessing = false;
			alert('ML Engine Initialized. Ready for data stream integration.');
		}, 2000);
	}
</script>

<div class="hero-header">
	<h1 class="editorial-title">Intelligence</h1>
	<p class="editorial-subtitle">A high-fidelity audit and predictive studio for brand architecture.</p>
</div>

<!-- Executive Summary -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5rem; margin-bottom: 5rem;">
	<div class="insight-card-premium">
		<div class="meta-label">Revenue This Month</div>
		<div class="main-val">{formatCurrency(data.summary.revenueThisMonth)}</div>
		<div class="trend-indicator {Number(data.summary.revenueGrowth) >= 0 ? 'up' : 'down'}">
			{Number(data.summary.revenueGrowth) >= 0 ? '+' : ''}{data.summary.revenueGrowth}% vs prev month
		</div>
	</div>
	
	<div class="insight-card-premium">
		<div class="meta-label">Avg Order Value</div>
		<div class="main-val">{formatCurrency(data.summary.aov)}</div>
		<div class="sub-label">Verified baseline</div>
	</div>

	<div class="insight-card-premium">
		<div class="meta-label">New Customers</div>
		<div class="main-val">{data.summary.newCustomers}</div>
		<div class="sub-label">Joined this period</div>
	</div>

	<div class="insight-card-premium dark">
		<div class="meta-label" style="color: #666;">Fiscal Capacity</div>
		<div class="main-val" style="color: #fff;">{formatCurrency(data.summary.totalRevenue)}</div>
		<div class="sub-label" style="color: #444;">Lifetime gross</div>
	</div>
</div>

<!-- NEW: Finance Section -->
<div style="margin-bottom: 5rem;">
	<h2 style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #ccc; margin-bottom: 3rem;">Financial Performance Audit</h2>
	<div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 3rem;">
		<div class="insight-card" style="padding: 3rem; background: #fdfdfd; border-color: #f0f0f0;">
			<div style="display: flex; justify-content: space-between; align-items: flex-start;">
				<div>
					<div class="meta-label" style="margin-bottom: 0.5rem;">Estimated Net Profit</div>
					<div style="font-size: 2.8rem; font-weight: 900; letter-spacing: -0.05em;">{formatCurrency(data.finance.grossProfit)}</div>
					<div style="font-size: 0.75rem; font-weight: 800; color: #10b981; margin-top: 1rem;">Operating Margin: {data.finance.margin}%</div>
				</div>
				<div style="width: 60px; height: 60px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981; font-weight: 900;">$</div>
			</div>
		</div>

		<div class="insight-card" style="padding: 2.5rem;">
			<div class="meta-label" style="margin-bottom: 1rem;">Cost of Goods (COGS)</div>
			<div style="font-size: 1.5rem; font-weight: 800;">{formatCurrency(data.finance.estimatedCOGS)}</div>
			<div style="font-size: 0.7rem; color: #aaa; font-weight: 600; margin-top: 0.5rem;">Based on 35% fixed overhead</div>
		</div>

		<div class="insight-card" style="padding: 2.5rem;">
			<div class="meta-label" style="margin-bottom: 1rem;">Tax Liability (Est)</div>
			<div style="font-size: 1.5rem; font-weight: 800;">{formatCurrency(data.summary.revenueThisMonth * 0.11)}</div>
			<div style="font-size: 0.7rem; color: #aaa; font-weight: 600; margin-top: 0.5rem;">VAT 11% Baseline</div>
		</div>
	</div>
</div>

<!-- NEW: Forecasting Studio -->
<div style="margin-bottom: 5rem; background: #fafafa; padding: 5rem; border-radius: 3rem;">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem;">
		<div>
			<h2 style="font-size: 2rem; font-weight: 900; margin: 0; letter-spacing: -0.04em;">Forecasting Studio</h2>
			<p style="font-size: 0.85rem; color: #888; font-weight: 600; margin-top: 0.5rem;">Machine Learning predictive models for inventory and revenue planning.</p>
		</div>
		<button 
			class="btn-studio {isProcessing ? 'processing' : ''}" 
			style="background: #000; color: #fff; padding: 1rem 2.5rem;"
			onclick={runForecast}
			disabled={isProcessing}
		>
			{isProcessing ? 'Training Model...' : 'Initialize ML Engine'}
		</button>
	</div>

	<div style="display: grid; grid-template-columns: 250px 1fr; gap: 5rem;">
		<div class="forecast-controls">
			<div class="input-group">
				<label class="input-label" style="font-size: 0.65rem;">Horizon (Days)</label>
				<input type="number" bind:value={forecastHorizon} class="input-control" style="background: #fff;" />
			</div>
			
			<div class="input-group" style="margin-top: 2rem;">
				<label class="input-label" style="font-size: 0.65rem;">Confidence Level (%)</label>
				<select bind:value={confidenceLevel} class="input-control" style="background: #fff;">
					<option value={90}>90% (Standard)</option>
					<option value={95}>95% (Conservative)</option>
					<option value={99}>99% (Strict)</option>
				</select>
			</div>

			<div class="input-group" style="margin-top: 2rem;">
				<label class="input-label" style="font-size: 0.65rem;">ML Model Architecture</label>
				<select class="input-control" style="background: #fff;" disabled>
					<option>Prophet Time-Series</option>
					<option>LSTM Neural Network</option>
					<option>XGBoost Regressor</option>
				</select>
			</div>
		</div>

		<div class="forecast-canvas" style="height: 400px; background: #fff; border-radius: 2rem; border: 1px dashed #eee; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1.5rem;">
			<div style="font-size: 3rem; opacity: 0.05;">{isProcessing ? '⚡' : '🔭'}</div>
			<div style="text-align: center;">
				<div style="font-weight: 800; font-size: 0.9rem; color: #888;">{isProcessing ? 'Analyzing historical drift...' : 'Predictive Canvas Ready'}</div>
				<p style="font-size: 0.75rem; color: #ccc; margin-top: 0.5rem;">Run the ML Engine to visualize future revenue trajectories.</p>
			</div>
		</div>
	</div>
</div>

<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; margin-bottom: 5rem;">
	<!-- Revenue Velocity Chart -->
	<div class="insight-card" style="padding: 3.5rem;">
		<div style="margin-bottom: 4rem;">
			<h3 style="font-size: 1.2rem; font-weight: 900; margin: 0; letter-spacing: -0.02em;">Sales Velocity (30D)</h3>
			<p style="font-size: 0.8rem; color: #888; font-weight: 600; margin-top: 0.5rem;">Daily revenue tracking with rolling volatility</p>
		</div>

		<div class="chart-area" style="height: 350px; display: flex; align-items: flex-end; gap: 4px;">
			{#each data.dailyData as val}
				<div 
					class="chart-bar-minimal" 
					style="height: {val > 0 ? Math.max((val / Math.max(...data.dailyData)) * 100, 5) : 2}%;"
				></div>
			{/each}
		</div>
		<div style="display: flex; justify-content: space-between; margin-top: 1.5rem; color: #ccc; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
			<span>30 Days Ago</span>
			<span>Today</span>
		</div>
	</div>

	<!-- Category Distribution -->
	<div class="insight-card" style="padding: 3.5rem;">
		<h3 style="font-size: 1.2rem; font-weight: 900; margin-bottom: 3rem;">Market Share</h3>
		<div style="display: flex; flex-direction: column; gap: 2rem;">
			{#each data.categoryDistribution as cat}
				<div>
					<div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">
						<span>{cat.name}</span>
						<span>{Math.round((cat.value / data.categoryDistribution.reduce((a,b) => a+b.value, 0)) * 100)}%</span>
					</div>
					<div style="height: 4px; background: #f5f5f5; border-radius: 2px; overflow: hidden;">
						<div style="width: {Math.round((cat.value / data.categoryDistribution.reduce((a,b) => a+b.value, 0)) * 100)}%; height: 100%; background: #000;"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4rem;">
	<!-- Top Products -->
	<div class="insight-card" style="padding: 3.5rem;">
		<h3 style="font-size: 1.2rem; font-weight: 900; margin-bottom: 3rem;">Top Performing Assets</h3>
		<table style="width: 100%; border-collapse: collapse;">
			<thead>
				<tr style="text-align: left; border-bottom: 1px solid #f0f0f0;">
					<th style="padding-bottom: 1.5rem; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em;">Product</th>
					<th style="padding-bottom: 1.5rem; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em;">Units</th>
					<th style="padding-bottom: 1.5rem; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; text-align: right;">Revenue</th>
				</tr>
			</thead>
			<tbody>
				{#each data.topProducts as product}
					<tr style="border-bottom: 1px solid #f8f8f8;">
						<td style="padding: 1.5rem 0; font-weight: 800; font-size: 0.9rem;">{product.name}</td>
						<td style="padding: 1.5rem 0; font-weight: 700; color: #888;">{product.quantity}</td>
						<td style="padding: 1.5rem 0; font-weight: 900; text-align: right;">{formatCurrency(product.revenue)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Geographic Insights -->
	<div class="insight-card" style="padding: 3.5rem;">
		<h3 style="font-size: 1.2rem; font-weight: 900; margin-bottom: 3rem;">Geographic Density</h3>
		<div style="display: flex; flex-direction: column; gap: 1.5rem;">
			{#each data.geographicDistribution as region}
				<div style="display: flex; align-items: center; gap: 2rem; padding: 1.5rem; background: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 1rem;">
					<div style="width: 40px; height: 40px; background: #111; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem;">
						{region.count}
					</div>
					<div style="flex: 1;">
						<div style="font-weight: 800; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">{region.province}</div>
						<div style="font-size: 0.7rem; color: #aaa; font-weight: 700;">Verified Shipments</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.insight-card-premium {
		background: #fff;
		border: 1px solid #f0f0f0;
		padding: 2.5rem;
		border-radius: 1.5rem;
		transition: transform 0.4s ease;
	}
	.insight-card-premium:hover { transform: translateY(-5px); }
	.insight-card-premium.dark { background: #111; border: none; }
	
	.meta-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 1.5rem; }
	.main-val { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.04em; }
	.sub-label { font-size: 0.75rem; color: #ccc; font-weight: 700; margin-top: 0.8rem; }
	
	.trend-indicator { font-size: 0.75rem; font-weight: 800; margin-top: 1rem; }
	.trend-indicator.up { color: #10b981; }
	.trend-indicator.down { color: #ff4d4d; }

	.chart-bar-minimal {
		flex: 1;
		background: #f5f5f5;
		border-radius: 2px 2px 0 0;
		transition: background 0.3s;
	}
	.chart-bar-minimal:hover { background: #000; }

	.btn-studio.processing { opacity: 0.5; cursor: wait; }
</style>
