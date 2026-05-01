<script lang="ts">
  let { data } = $props();
  import { enhance } from '$app/forms';

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStatusClass(status: string) {
    if (['SHIPPED', 'DELIVERED'].includes(status)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'cancelled';
    return 'pending';
  }
</script>

{#if !data.order}
  <div style="padding: 5rem; text-align: center;">Order not found.</div>
{:else}
  <div class="hero-header" style="margin-bottom: 3rem; display: flex; justify-content: space-between; align-items: flex-end;">
    <div>
      <div style="font-size: 0.8rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Transaction Detail</div>
      <h1 class="editorial-title" style="font-size: 2rem;">#{data.order.id.slice(-8).toUpperCase()}</h1>
    </div>
    <span class="status-pill {getStatusClass(data.order.status)}" style="font-size: 0.85rem; padding: 0.6rem 1.5rem;">{data.order.status.replace('_', ' ')}</span>
  </div>

  <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem;">
    <!-- LEFT: Payment & Items (Receipt Style) -->
    <div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; padding: 2.5rem;">
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">Receipt Breakdown</h2>
      
      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem;">
        {#each data.order.items as item}
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">{item.name || 'Product Item'}</div>
              <div style="font-size: 0.8rem; color: #888;">{item.quantity} × {formatCurrency(item.price)}</div>
            </div>
            <div style="font-weight: 800;">{formatCurrency(item.quantity * item.price)}</div>
          </div>
        {/each}
      </div>

      <div style="border-top: 2px dashed #eee; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; font-size: 1.1rem;">Total Gross</span>
        <span style="font-weight: 900; font-size: 1.4rem;">{formatCurrency(data.order.totalAmount)}</span>
      </div>

      <div style="margin-top: 3rem; background: #fafafa; padding: 1.5rem; border-radius: 0.8rem;">
        <div style="font-size: 0.8rem; font-weight: 700; color: #888; margin-bottom: 0.5rem;">Customer Information</div>
        <div style="font-weight: 600;">{data.order.customer?.name || 'Guest'}</div>
        <div style="font-size: 0.85rem; color: #555; margin-top: 0.2rem;">{data.order.customer?.email}</div>
      </div>
    </div>

    <!-- RIGHT: Logistics & Tracking -->
    <div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; padding: 2.5rem;">
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">Logistics Status</h2>

      {#if data.order.status === 'AWAITING_PAYMENT'}
        <div style="padding: 2rem; text-align: center; color: #888; background: #fafafa; border-radius: 0.8rem;">Awaiting payment completion before shipping.</div>
      
      {:else if data.order.status === 'PROCESSING'}
        <form method="POST" action="?/initTracking" use:enhance style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div>
            <label class="input-label" style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase;">Select Carrier</label>
            <select name="carrierId" class="input-control" required style="padding: 0.8rem; margin-top: 0.5rem;">
              {#each data.carriers as carrier}
                <option value={carrier.id}>{carrier.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="input-label" style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase;">Tracking Number (Resi)</label>
            <input type="text" name="trackingNumber" class="input-control" required placeholder="e.g. JP1234567890" style="padding: 0.8rem; margin-top: 0.5rem;" />
          </div>
          <button type="submit" class="btn-studio" style="width: 100%; justify-content: center;">Initialize Shipping</button>
        </form>

      {:else if data.tracking}
        <div style="margin-bottom: 2rem; background: #fafafa; padding: 1.5rem; border-radius: 0.8rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-weight: 700;">{data.tracking.carrier.name}</span>
            <span style="font-weight: 800;">{data.tracking.trackingNumber}</span>
          </div>
          <div style="font-size: 0.8rem; color: #15803d; font-weight: 600;">Status: {data.tracking.currentStatus}</div>
        </div>

        <!-- Add Log Form -->
        {#if data.order.status !== 'DELIVERED'}
          <form method="POST" action="?/addLog" use:enhance style="display: flex; gap: 1rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #eee;">
            <input type="hidden" name="trackingId" value={data.tracking.id} />
            <select name="status" class="input-control" style="padding: 0.6rem; font-size: 0.8rem; flex: 1;">
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ARRIVED_AT_SORTING_CENTER">Arrived at Facility</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <input type="text" name="location" placeholder="Location" class="input-control" style="padding: 0.6rem; font-size: 0.8rem; flex: 1;" />
            <button type="submit" class="btn-studio" style="padding: 0.6rem 1rem; font-size: 0.75rem;">Add Log</button>
          </form>
        {/if}

        <!-- Timeline -->
        <div style="position: relative; padding-left: 1.5rem; border-left: 2px solid #eee;">
          {#each data.tracking.logs as log}
            <div style="position: relative; margin-bottom: 1.5rem;">
              <div style="position: absolute; left: -1.8rem; top: 4px; width: 12px; height: 12px; background: {log.status === 'DELIVERED' ? '#15803d' : '#000'}; border-radius: 50%; border: 2px solid #fff;"></div>
              <div style="font-weight: 800; font-size: 0.9rem;">{log.status.replace(/_/g, ' ')}</div>
              {#if log.location}
                <div style="font-size: 0.8rem; color: #555; margin-top: 0.2rem; font-weight: 600;">📍 {log.location}</div>
              {/if}
              <div style="font-size: 0.75rem; color: #aaa; margin-top: 0.2rem;">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}