<script lang="ts">
  let { data, form } = $props();
  import { enhance } from '$app/forms';
  import { Printer, MapPin } from '@lucide/svelte';

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
  <div class="order-detail-not-found">Order not found.</div>
{:else}
  <div class="hero-header order-detail-hero">
    <div>
      <div class="order-detail-hero-label">Transaction Detail</div>
      <h1 class="editorial-title order-detail-title">#{data.order.id.slice(-8).toUpperCase()}</h1>
    </div>
    <div style="display: flex; gap: 1rem; align-items: center;">
      {#if ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(data.order.status)}
        <a href="/orders/{data.order.id}/label" target="_blank" class="btn-studio" style="display: flex; align-items: center; gap: 0.5rem; background: transparent; color: #000; border: 1px solid #000; text-decoration: none; padding: 0.5rem 1rem;">
          <Printer size={16} /> Print Label
        </a>
      {/if}
      <span class="status-pill {getStatusClass(data.order.status)} order-detail-status-pill">{data.order.status.replace('_', ' ')}</span>
    </div>
  </div>

  <div class="order-detail-layout">
    <!-- LEFT: Payment & Items (Receipt Style) -->
    <div class="order-detail-panel">
      <h2 class="order-detail-panel-title">Receipt Breakdown</h2>
      
      <div class="receipt-breakdown">
        {#each data.order.items as item}
          <div class="receipt-item">
            <div>
              <div class="receipt-item-name">{item.name || 'Product Item'}</div>
              <div class="receipt-item-meta">{item.quantity} × {formatCurrency(item.price)}</div>
            </div>
            <div class="receipt-item-price">{formatCurrency(item.quantity * item.price)}</div>
          </div>
        {/each}
      </div>

      <div class="receipt-total">
        <span class="receipt-total-label">Total Gross</span>
        <span class="receipt-total-value">{formatCurrency(data.order.totalAmount)}</span>
      </div>

      <div class="order-customer-panel">
        <div class="order-customer-label">Customer Information</div>
        <div class="order-customer-name">{data.order.customer?.name || 'Guest'}</div>
        <div class="order-customer-email">{data.order.customer?.email}</div>
      </div>
    </div>

    <!-- RIGHT: Logistics & Tracking -->
    <div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; padding: 2.5rem;">
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">Logistics Status</h2>

      {#if data.order.status === 'AWAITING_PAYMENT'}
        <div class="logistics-awaiting-payment">Awaiting payment completion before shipping.</div>
        <form method="POST" action="?/cancelOrder" use:enhance class="mt-4">
          <button type="submit" class="btn-studio logistics-btn-submit" style="background: #ef4444; color: white;">Cancel Order</button>
        </form>
      
      {:else if data.order.status === 'PROCESSING'}
        <div class="logistics-awaiting-payment" style="margin-bottom: 1rem; color: #666;">Order paid. Select a carrier to dispatch.</div>
        <form method="POST" action="?/initTracking" use:enhance class="logistics-form">
          <div>
            <label for="carrier-select" class="input-label logistics-form-label">Select Carrier</label>
            <select id="carrier-select" name="carrierId" required class="input-control logistics-select">
              {#each (data.carriers as any[]) as carrier}
                <option value={carrier.id}>{carrier.name}</option>
              {/each}
            </select>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="submit" class="btn-studio logistics-btn-submit">Initialize Shipping</button>
            <button type="submit" formaction="?/cancelOrder" class="btn-studio logistics-btn-submit" style="background: transparent; color: #ef4444; border: 1px solid #ef4444;">Cancel Order</button>
          </div>
        </form>

      {:else if data.tracking}
        <div class="tracking-summary-panel">
          <div class="tracking-summary-header">
            <span class="tracking-carrier-name">{data.tracking.carrier.name}</span>
            <span class="tracking-resi-number">{data.tracking.trackingNumber}</span>
          </div>
          <div class="tracking-status-text">Status: {data.tracking.currentStatus}</div>
        </div>

        <!-- Add Log Form -->
        {#if data.order.status !== 'DELIVERED'}
          <form method="POST" action="?/addLog" use:enhance class="tracking-log-form">
            <input type="hidden" name="trackingNumber" value={data.tracking.trackingNumber} />
            <select name="status" class="input-control tracking-log-select">
              <option value="IN_TRANSIT">In Transit</option>
              <option value="ARRIVED_AT_SORTING_CENTER">Arrived at Facility</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <input type="text" name="location" placeholder="Location" class="input-control tracking-log-input" />
            <button type="submit" class="btn-studio tracking-log-btn">Add Log</button>
          </form>
        {/if}

        <!-- Timeline -->
        <div class="timeline-container">
          {#each (data.tracking?.logs || []) as log}
            <div class="timeline-item">
              <div class="timeline-dot" class:delivered={log.status === "DELIVERED"} class:pending={log.status !== "DELIVERED"}></div>
              <div class="timeline-status">{log.status.replace(/_/g, ' ')}</div>
              {#if log.location}
                <div class="timeline-location" style="display: flex; align-items: center; gap: 0.25rem;">
                  <MapPin size={14} /> {log.location}
                </div>
              {/if}
              <div class="timeline-time">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          {/each}
        </div>
        {/if}
        </div>
        </div>
        {/if}