<script lang="ts">
	let { data } = $props();
	
	const orders = $derived(data.orders);

	function getStatusClass(status: string) {
		return status.toLowerCase().replace('_', '');
	}
</script>

<div class="studio-section" style="margin-bottom: 2rem;">
	<div style="display: flex; justify-content: space-between; align-items: flex-end;">
		<div>
			<h1 class="editorial-title">Orders</h1>
			<p class="editorial-subtitle" style="margin-top: 1rem;">Managing the commerce flow of the Novure ecosystem.</p>
		</div>
		<div style="display: flex; gap: 2rem; align-items: center;">
			<form method="GET" style="position: relative;">
				<input 
					type="text" 
					name="q" 
					placeholder="Search orders..." 
					value={data.query}
					class="input-control" 
					style="padding: 1rem 1.5rem; width: 300px; border-radius: 999px; background: var(--surface-soft);"
				/>
			</form>
		</div>
	</div>

	<!-- Status Tabs -->
	<div style="display: flex; gap: 3rem; margin-top: 4rem; padding-bottom: 1rem; overflow-x: auto;">
		<a href="/orders" class="nav-item active" style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;">All Volume</a>
		<a href="/orders?status=PROCESSING" class="nav-item" style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;">Fulfillment</a>
		<a href="/orders?status=SHIPPED" class="nav-item" style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;">Transit</a>
		<a href="/orders?status=DELIVERED" class="nav-item" style="font-size: 0.75rem; text-decoration: none; padding-bottom: 1.5rem;">Completed</a>
	</div>
</div>

<div class="studio-section" style="padding: 0; overflow: hidden;">
	<table style="width: 100%; border-collapse: collapse;">
		<thead>
			<tr style="background: #fafafa; border-bottom: 1px solid var(--border-soft);">
				<th style="padding: 2rem 3rem; text-align: left; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em;">Identifier</th>
				<th style="padding: 2rem 3rem; text-align: left; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em;">Customer</th>
				<th style="padding: 2rem 3rem; text-align: left; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em;">Condition</th>
				<th style="padding: 2rem 3rem; text-align: right; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em;">Value</th>
				<th style="padding: 2rem 3rem; text-align: right; font-size: 0.7rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em;">Action</th>
			</tr>
		</thead>
		<tbody>
			{#each orders as order}
				<tr class="order-row" style="border-bottom: 1px solid var(--border-soft); transition: background 0.3s ease;">
					<td style="padding: 2.5rem 3rem;">
						<div style="font-weight: 900; font-size: 1rem; letter-spacing: -0.02em;">#{order.id.slice(-6).toUpperCase()}</div>
						<div style="font-size: 0.7rem; color: #aaa; font-weight: 700; margin-top: 0.4rem;">{new Date(order.createdAt).toLocaleDateString()}</div>
					</td>
					<td style="padding: 2.5rem 3rem;">
						<div style="font-weight: 800; font-size: 0.95rem;">{order.user?.name || 'Private Client'}</div>
						<div style="font-size: 0.7rem; color: #aaa; font-weight: 700; margin-top: 0.4rem;">{order.user?.email}</div>
					</td>
					<td style="padding: 2.5rem 3rem;">
						<span class="status-pill {getStatusClass(order.status)}">
							{order.status.replace('_', ' ')}
						</span>
					</td>
					<td style="padding: 2.5rem 3rem; text-align: right;">
						<div style="font-weight: 900; font-size: 1.1rem; letter-spacing: -0.02em;">Rp {Number(order.totalAmount).toLocaleString()}</div>
						<div style="font-size: 0.65rem; font-weight: 800; color: #ccc; text-transform: uppercase; margin-top: 0.4rem;">Gross Total</div>
					</td>
					<td style="padding: 2.5rem 3rem; text-align: right;">
						<a href="/orders/{order.id}" class="btn-studio-secondary" style="padding: 0.7rem 1.5rem; font-size: 0.65rem;">
							Manage
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if orders.length === 0}
	<div class="studio-section" style="text-align: center; padding: 10rem 0; opacity: 0.1;">
		<h2 style="font-size: 4rem; font-weight: 900;">Zero Volume</h2>
	</div>
{/if}

<style>
	.order-row:hover {
		background: #fdfdfd;
	}
</style>
