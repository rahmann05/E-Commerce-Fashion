<script lang="ts">
	import ExecutiveSummary from '@features/analytics/ExecutiveSummary.svelte';
	import FinanceAudit from '@features/analytics/FinanceAudit.svelte';
	import SalesVelocityChart from '@features/analytics/SalesVelocityChart.svelte';

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

<ExecutiveSummary summary={data.summary} />

<FinanceAudit finance={data.finance} revenueThisMonth={data.summary.revenueThisMonth} />

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
				<label for="horizon" class="input-label" style="font-size: 0.65rem;">Horizon (Days)</label>
				<input id="horizon" type="number" bind:value={forecastHorizon} class="input-control" style="background: #fff;" />
			</div>
			
			<div class="input-group" style="margin-top: 2rem;">
				<label for="confidence" class="input-label" style="font-size: 0.65rem;">Confidence Level (%)</label>
				<select id="confidence" bind:value={confidenceLevel} class="input-control" style="background: #fff;">
					<option value={90}>90% (Standard)</option>
					<option value={95}>95% (Conservative)</option>
					<option value={99}>99% (Strict)</option>
				</select>
			</div>

			<div class="input-group" style="margin-top: 2rem;">
				<label for="ml-model" class="input-label" style="font-size: 0.65rem;">ML Model Architecture</label>
				<select id="ml-model" class="input-control" style="background: #fff;" disabled>
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
	<SalesVelocityChart dailyData={data.dailyData} />

	<!-- Category Distribution -->
	<div class="insight-card" style="padding: 3.5rem; background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0;">
		<h3 style="font-size: 1.2rem; font-weight: 900; margin-bottom: 3rem;">Market Share</h3>
		<div style="display: flex; flex-direction: column; gap: 2rem;">
			{#each data.categoryDistribution as cat}
				{@const totalVal = data.categoryDistribution.reduce((acc: number, curr: any) => acc + curr.value, 0)}
				<div>
					<div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.8rem;">
						<span>{cat.name}</span>
						<span>{Math.round((cat.value / totalVal) * 100)}%</span>
					</div>
					<div style="height: 4px; background: #f5f5f5; border-radius: 2px; overflow: hidden;">
						<div style="width: {Math.round((cat.value / totalVal) * 100)}%; height: 100%; background: #000;"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4rem;">
	<!-- Top Products -->
	<div class="insight-card" style="padding: 3.5rem; background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0;">
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
	<div class="insight-card" style="padding: 3.5rem; background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0;">
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
	.btn-studio.processing { opacity: 0.5; cursor: wait; }
</style>
