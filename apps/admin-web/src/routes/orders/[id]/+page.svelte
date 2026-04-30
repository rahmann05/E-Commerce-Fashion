<script lang="ts">
	let { data } = $props();
	import { enhance } from '$app/forms';

	function getStatusMessage(status: string) {
		switch (status) {
			case 'AWAITING_PAYMENT': return 'Pending Payment: System is awaiting customer transaction.';
			case 'PROCESSING': return 'Ready for Shipment: Payment verified, awaiting admin fulfillment.';
			case 'SHIPPED': return 'In Transit: Order has been handed over to courier.';
			case 'DELIVERED': return 'Fulfilled: Order successfully received by customer.';
			case 'CANCELLED': return 'Void: Order cancelled or payment timed out.';
			default: return 'Unknown status.';
		}
	}

	function getImageUrl(url: string) {
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



<div class="hero-header">
	<div style="display: flex; justify-content: space-between; align-items: flex-end;">
		<div>
			<h1 class="editorial-title">Order #{data.order.id.slice(-4).toUpperCase()}</h1>
			<p class="editorial-subtitle">{getStatusMessage(data.order.status)}</p>
		</div>
		<div style="display: flex; gap: 0.8rem; align-items: center;">
			<button class="btn-studio-secondary" style="padding: 0.7rem 1.5rem; font-size: 0.8rem;">
				Print Invoice
			</button>
			
			{#if data.order.status === 'AWAITING_PAYMENT' || data.order.status === 'PROCESSING'}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="CANCELLED" />
					<button 
						type="submit" 
						class="btn-studio-secondary" 
						style="padding: 0.7rem 1.5rem; font-size: 0.8rem; color: #ff4d4d; border-color: #ffeded;"
						onclick={(e) => { if (!confirm('Batalkan pesanan ini?')) e.preventDefault(); }}
					>
						Batalkan Pesanan
					</button>
				</form>
			{/if}

			{#if data.order.status === 'PROCESSING'}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="SHIPPED" />
					<button type="submit" class="btn-studio" style="padding: 0.7rem 2rem; font-size: 0.8rem; background: #000; color: #fff;">
						Kirim Pesanan
					</button>
				</form>
			{/if}
		</div>

	</div>
</div>

<div class="modal-sheet-container" style="max-width: 900px; margin: 0 auto; background: #fff; padding: 4rem; border-radius: 1.5rem; border: 1px solid #f0f0f0; box-shadow: 0 30px 100px rgba(0,0,0,0.05);">
	<!-- Workflow Validation Timeline -->
	<section style="margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 1px solid #f8f8f8;">
		<div style="font-size: 0.7rem; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2rem;">Business Validation Timeline</div>
		<div style="display: flex; justify-content: space-between; position: relative;">
			<div style="position: absolute; top: 12px; left: 0; width: 100%; height: 2px; background: #f0f0f0; z-index: 1;"></div>
			
			{#each ['AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as step, i}
				<div style="z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; background: #fff; padding: 0 1rem;">
					<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid {data.order.status === step ? '#000' : '#f0f0f0'}; background: {data.order.status === step ? '#000' : '#fff'}; display: flex; align-items: center; justify-content: center;">
						{#if i < ['AWAITING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(data.order.status)}
							<div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
						{/if}
					</div>
					<span style="font-size: 0.6rem; font-weight: 800; color: {data.order.status === step ? '#000' : '#ccc'}; text-transform: uppercase;">{step.replace('_', ' ')}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Order Items -->
	<section style="margin-bottom: 4rem;">
		<div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 2.5rem; display: flex; align-items: center; gap: 0.5rem;">
			Order items <span style="color: #aaa; font-weight: 600;">{data.order.items.length}</span>
		</div>
		
		<div style="display: flex; flex-direction: column; gap: 2rem;">
			{#each data.order.items as item}
				<div style="display: flex; gap: 2rem; align-items: center; padding-bottom: 1.5rem; border-bottom: 1px solid #f8f8f8;">
					<div style="width: 60px; height: 60px; background: #f8f8f8; border-radius: 0.8rem; overflow: hidden; border: 1px solid #f0f0f0;">
						{#if item.imageUrl}
							<img src={getImageUrl(item.imageUrl)} alt="" style="width: 100%; height: 100%; object-fit: cover;" />
						{/if}
					</div>

					<div style="flex: 1;">
						<div style="font-size: 0.95rem; font-weight: 800;">{item.name}</div>
						<div style="font-size: 0.8rem; color: #aaa; margin-top: 0.3rem; font-weight: 600;">
							{item.size || 'Standard'} — {item.color || 'Default'}
						</div>
					</div>
					<div style="text-align: right; display: flex; align-items: center; gap: 2rem;">
						<div style="font-size: 0.9rem; font-weight: 700;">{item.quantity} ×</div>
						<div style="font-size: 1rem; font-weight: 900;">Rp {item.price.toLocaleString()}</div>
					</div>
				</div>
			{/each}
		</div>

		<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; padding-top: 1.5rem; border-top: 2px solid #f0f0f0;">
			<span style="font-size: 1.1rem; font-weight: 800;">Total</span>
			<span style="font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em;">Rp {data.order.totalAmount.toLocaleString()}</span>
		</div>
	</section>

	<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5rem;">
		<!-- Contacts -->
		<section>
			<div style="font-size: 1rem; font-weight: 800; margin-bottom: 2rem;">Contacts</div>
			<div style="display: flex; flex-direction: column; gap: 1.2rem;">
				<div style="display: grid; grid-template-columns: 1fr 2fr; font-size: 0.85rem;">
					<span style="color: #aaa; font-weight: 600;">Customer</span>
					<span style="font-weight: 700;">{data.order.user?.name || 'Guest'}</span>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 2fr; font-size: 0.85rem;">
					<span style="color: #aaa; font-weight: 600;">Email</span>
					<span style="font-weight: 700; color: #3b82f6;">{data.order.user?.email || '-'}</span>
				</div>
				<div style="display: grid; grid-template-columns: 1fr 2fr; font-size: 0.85rem;">
					<span style="color: #aaa; font-weight: 600;">Phone</span>
					<span style="font-weight: 700;">{data.order.user?.phone || '+1 (415) 555-2671'}</span>
				</div>
			</div>
		</section>

		<!-- Delivery -->
		<section>
			<div style="font-size: 1rem; font-weight: 800; margin-bottom: 2rem;">Delivery</div>
			{#if data.order.address}
				<div style="font-size: 0.85rem; line-height: 1.6; font-weight: 700; color: #111; margin-bottom: 2rem;">
					<div style="margin-bottom: 0.5rem; color: #888;">{data.order.address.recipient || data.order.user?.name}</div>
					{data.order.address.line1}, {data.order.address.district}<br/>
					{data.order.address.city}, {data.order.address.province}<br/>
					{data.order.address.postalCode}
				</div>

				<!-- Stylized Map Container -->
				<div style="width: 100%; height: 200px; background: #f8f8f8; border-radius: 1rem; overflow: hidden; border: 1px solid #f0f0f0; position: relative;">
					<iframe 
						width="100%" 
						height="100%" 
						frameborder="0" 
						title="Delivery Location Map"
						style="border:0; filter: grayscale(1) contrast(1.2) opacity(0.8);" 
						src="https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_REAL_KEY&q={encodeURIComponent(`${data.order.address.line1}, ${data.order.address.city}`)}"
						allowfullscreen
					></iframe>

					<!-- Aesthetic Overlay if key is missing -->
					<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(250,250,250,0.8); pointer-events: none;">
						<div style="text-align: center;">
							<div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📍</div>
							<div style="font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa;">Location Verified</div>
						</div>
					</div>
				</div>
			{:else}
				<div style="font-size: 0.85rem; color: #aaa; font-style: italic;">No shipping information provided.</div>
			{/if}
		</section>

	</div>
</div>


