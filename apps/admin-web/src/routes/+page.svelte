<script lang="ts">
	let { data } = $props();

	function getImageUrl(url: string | null) {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		
		const SUPABASE_STORAGE_URL = 'https://ghdadhlyhzdkrjlurifj.supabase.co/storage/v1/object/public';
		const BUCKET_NAME = 'product';
		
		let cleanPath = url.startsWith('/') ? url.slice(1) : url;
		if (cleanPath.startsWith('images/')) {
			cleanPath = cleanPath.replace('images/', '');
		}
		return `${SUPABASE_STORAGE_URL}/${BUCKET_NAME}/${cleanPath}`;
	}
</script>

<div class="command-header" style="margin-bottom: 4rem;">
	<div style="display: flex; justify-content: space-between; align-items: center;">
		<div>
			<h1 class="editorial-title" style="margin: 0; font-size: 3.5rem;">Operations</h1>
			<div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.8rem;">
				<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981;"></div>
				<p class="editorial-subtitle" style="margin: 0; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">System Live — Real-time Business Intelligence</p>
			</div>
		</div>
		
		<div style="display: flex; gap: 1.5rem;">
			<div class="alert-badge {data.businessMetrics.fulfillmentQueue > 0 ? 'urgent' : ''}">
				<span class="badge-label">Fulfillment Queue</span>
				<span class="badge-value">{data.businessMetrics.fulfillmentQueue}</span>
			</div>
			<div class="alert-badge {data.businessMetrics.inventoryAlerts.out > 0 ? 'critical' : ''}">
				<span class="badge-label">Stock Crisis</span>
				<span class="badge-value">{data.businessMetrics.inventoryAlerts.out}</span>
			</div>
		</div>
	</div>
</div>

<!-- Primary KPI Grid -->
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 4rem;">
	<div class="kpi-card">
		<div class="kpi-label">Revenue Today</div>
		<div class="kpi-value">Rp {(data.businessMetrics.performance.revenueToday < 10000 ? data.businessMetrics.performance.revenueToday * 1000 : data.businessMetrics.performance.revenueToday).toLocaleString()}</div>
		<div class="kpi-trend positive">+14% vs avg</div>
	</div>
	<div class="kpi-card">
		<div class="kpi-label">Sales Velocity</div>
		<div class="kpi-value">{data.businessMetrics.performance.velocity} <span style="font-size: 1rem; opacity: 0.4;">orders/day</span></div>
		<div class="kpi-trend">Consistent</div>
	</div>
	<div class="kpi-card">
		<div class="kpi-label">Avg Order Value</div>
		<div class="kpi-value">Rp {Math.round(data.businessMetrics.performance.aov < 10000 ? data.businessMetrics.performance.aov * 1000 : data.businessMetrics.performance.aov).toLocaleString()}</div>
		<div class="kpi-trend positive">↑ Growth</div>
	</div>
	<div class="kpi-card dark">
		<div class="kpi-label" style="color: rgba(255,255,255,0.5);">Gross Portfolio</div>
		<div class="kpi-value" style="color: #fff;">Rp {(data.businessMetrics.performance.totalRevenue < 10000 ? data.businessMetrics.performance.totalRevenue * 1000 : data.businessMetrics.performance.totalRevenue).toLocaleString()}</div>
		<div class="kpi-trend" style="color: #10b981;">Verified</div>
	</div>
</div>

<div class="dashboard-grid" style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 3rem;">
	<!-- Main Operations View -->
	<div class="section-container">
		<div class="insight-card" style="padding: 3rem; margin-bottom: 3rem;">
			<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem;">
				<div>
					<h3 style="font-size: 1.2rem; font-weight: 900; margin: 0; letter-spacing: -0.02em;">Brand Growth Velocity</h3>
					<p style="font-size: 0.8rem; color: #888; font-weight: 600; margin-top: 0.4rem;">Revenue trajectory across current semester</p>
				</div>
				<div style="display: flex; gap: 1rem;">
					<button class="toggle-btn active">Revenue</button>
					<button class="toggle-btn">Orders</button>
				</div>
			</div>

			<div style="display: flex; align-items: flex-end; height: 300px; gap: 1.5rem; padding-bottom: 2rem; border-bottom: 1px solid #f5f5f5;">
				{#each data.chartData as item}
					<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; height: 100%; justify-content: flex-end;">
						<div 
							style="width: 100%; height: {item.value}%; background: {item.active ? '#000' : '#f0f0f0'}; border-radius: 0.8rem; transition: all 0.6s ease; position: relative;"
							class="velocity-bar"
						>
							{#if item.active}
								<div class="bar-tooltip">Target Met</div>
							{/if}
						</div>
						<span style="font-size: 0.7rem; font-weight: 800; color: {item.active ? '#000' : '#ccc'}; text-transform: uppercase; letter-spacing: 0.05em;">{item.month}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="insight-card" style="padding: 3rem;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
				<h3 style="font-size: 1.2rem; font-weight: 900; margin: 0;">Fulfillment Activity</h3>
				<a href="/orders" style="font-size: 0.75rem; font-weight: 800; color: #111; text-decoration: none; border-bottom: 1px solid #ddd; padding-bottom: 2px;">Process All</a>
			</div>
			
			<div style="display: flex; flex-direction: column; gap: 0.5rem;">
				{#each data.recentOrders as order}
					<a href="/orders/{order.id}" class="activity-row">
						<div style="display: flex; align-items: center; gap: 1.5rem; flex: 1;">
							<div class="status-dot {order.status.toLowerCase()}"></div>
							<div>
								<div style="font-weight: 800; font-size: 0.9rem;">{order.user?.name || 'Anonymous Client'}</div>
								<div style="font-size: 0.75rem; color: #aaa; font-weight: 600;">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • #{order.id.slice(-6).toUpperCase()}</div>
							</div>
						</div>
						<div style="text-align: right;">
							<div style="font-weight: 900; font-size: 1rem;">Rp {Number(order.totalAmount).toLocaleString()}</div>
							<div style="font-size: 0.65rem; font-weight: 800; color: #ccc; text-transform: uppercase;">Verified</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- Sidebar Insights -->
	<div class="sidebar-container">
		<div class="insight-card" style="background: #fdfdfd; padding: 2.5rem; margin-bottom: 2.5rem;">
			<h3 style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #ccc; margin-bottom: 2rem;">Inventory Crisis</h3>
			<div style="display: flex; flex-direction: column; gap: 1.5rem;">
				<div class="stat-mini">
					<span class="mini-label">Out of Stock</span>
					<span class="mini-value critical">{data.businessMetrics.inventoryAlerts.out}</span>
				</div>
				<div class="stat-mini">
					<span class="mini-label">Low Threshold</span>
					<span class="mini-value urgent">{data.businessMetrics.inventoryAlerts.low}</span>
				</div>
				<a href="/products" class="mini-action">Stock Audit →</a>
			</div>
		</div>

		<div class="insight-card" style="padding: 2.5rem;">
			<h3 style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #ccc; margin-bottom: 2rem;">Top Performance</h3>
			<div style="display: flex; flex-direction: column; gap: 2rem;">
				{#each data.topProducts as product}
					<div style="display: flex; align-items: center; gap: 1.2rem;">
						<div style="width: 45px; height: 45px; background: #f8f8f8; border-radius: 0.8rem; overflow: hidden; border: 1px solid #f0f0f0;">
							{#if product.image}
								<img src={getImageUrl(product.image)} alt="" style="width: 100%; height: 100%; object-fit: cover;" />
							{/if}
						</div>
						<div style="flex: 1;">
							<div style="font-weight: 800; font-size: 0.85rem; line-height: 1.2;">{product.name}</div>
							<div style="font-size: 0.7rem; color: #10b981; font-weight: 700; margin-top: 0.2rem;">{product.count} Sold</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.alert-badge {
		padding: 0.8rem 1.8rem;
		background: #f8f8f8;
		border-radius: 999px;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		border: 1px solid #f0f0f0;
	}
	.alert-badge.urgent { border-color: #ffeded; background: #fffafb; }
	.alert-badge.critical { border-color: #ffeded; background: #fff1f2; }
	.badge-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #aaa; }
	.badge-value { font-size: 1.2rem; font-weight: 900; }
	.alert-badge.urgent .badge-value { color: #f59e0b; }
	.alert-badge.critical .badge-value { color: #ff4d4d; }

	.kpi-card {
		padding: 2.5rem;
		background: #fff;
		border: 1px solid #f0f0f0;
		border-radius: 1.5rem;
	}
	.kpi-card.dark { background: #111; border: none; }
	.kpi-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #ccc; margin-bottom: 1.5rem; }
	.kpi-value { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.04em; }
	.kpi-trend { font-size: 0.75rem; font-weight: 700; margin-top: 1rem; color: #aaa; }
	.kpi-trend.positive { color: #10b981; }

	.toggle-btn {
		background: none;
		border: none;
		font-size: 0.75rem;
		font-weight: 800;
		color: #ccc;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		transition: all 0.3s ease;
	}
	.toggle-btn.active { background: #f8f8f8; color: #000; }

	.bar-tooltip {
		position: absolute;
		top: -40px;
		left: 50%;
		transform: translateX(-50%);
		background: #000;
		color: #fff;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 0.65rem;
		font-weight: 800;
		white-space: nowrap;
		box-shadow: 0 10px 20px rgba(0,0,0,0.1);
	}

	.activity-row {
		display: flex;
		align-items: center;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
		border-radius: 1rem;
		transition: all 0.3s ease;
	}
	.activity-row:hover { background: #fdfdfd; transform: scale(1.01); }
	
	.status-dot { width: 8px; height: 8px; border-radius: 50%; }
	.status-dot.processing { background: #3b82f6; box-shadow: 0 0 10px #3b82f6; }
	.status-dot.shipped { background: #10b981; }
	.status-dot.awaiting_payment { background: #f59e0b; }

	.stat-mini { display: flex; justify-content: space-between; align-items: center; }
	.mini-label { font-size: 0.85rem; font-weight: 700; color: #666; }
	.mini-value { font-size: 1.1rem; font-weight: 900; }
	.mini-value.urgent { color: #f59e0b; }
	.mini-value.critical { color: #ff4d4d; }
	
	.mini-action {
		margin-top: 1rem;
		font-size: 0.7rem;
		font-weight: 800;
		color: #111;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.5;
		transition: opacity 0.3s;
	}
	.mini-action:hover { opacity: 1; }

	.velocity-bar:hover { background: #000 !important; transform: scaleX(1.05); }
</style>
