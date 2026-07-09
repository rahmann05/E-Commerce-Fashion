<script lang="ts">
  let { data } = $props();

  function printPage() {
    window.print();
  }
</script>

<svelte:head>
  <title>Shipping Label - #{data.order?.id?.slice(-8).toUpperCase()}</title>
  <style>
    @media print {
      body * {
        visibility: hidden;
      }
      .print-container, .print-container * {
        visibility: visible;
      }
      .print-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</svelte:head>

<div class="no-print" style="margin-bottom: 2rem;">
  <a href="/orders/{data.order?.id}" class="btn-studio" style="background: transparent; color: #000; border: 1px solid #ccc; display: inline-block; text-decoration: none; margin-right: 1rem;">&larr; Back to Order</a>
  <button onclick={printPage} class="btn-studio">Print Label</button>
</div>

{#if data.order}
  <div class="print-container" style="max-width: 800px; margin: 0 auto; background: white; border: 1px solid #000; padding: 2rem; font-family: 'Courier New', Courier, monospace;">
    
    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 1rem;">
      <div>
        <h1 style="font-size: 2rem; font-weight: bold; margin: 0;">NOVARIUM</h1>
        <p style="margin: 0.2rem 0; font-size: 0.9rem;">E-Commerce Fashion & Apparel</p>
      </div>
      <div style="text-align: right;">
        <h2 style="font-size: 1.5rem; margin: 0; font-weight: bold;">{data.tracking?.carrier?.name || 'REGULAR SHIPPING'}</h2>
        <p style="margin: 0.2rem 0; font-size: 1.2rem; font-weight: bold;">{data.tracking?.trackingNumber || 'AWAITING TRACKING NO'}</p>
      </div>
    </div>

    <!-- ADDRESSES -->
    <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
      <!-- SENDER -->
      <div style="flex: 1; border: 1px solid #000; padding: 1rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; text-decoration: underline;">FROM (SENDER):</h3>
        <p style="margin: 0; font-weight: bold;">Novarium Warehouse</p>
        <p style="margin: 0;">Jl. Sudirman No. 123</p>
        <p style="margin: 0;">Jakarta Pusat, 10220</p>
        <p style="margin: 0;">0812-3456-7890</p>
      </div>

      <!-- RECEIVER -->
      <div style="flex: 1; border: 1px solid #000; padding: 1rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; text-decoration: underline;">TO (RECEIVER):</h3>
        {#if data.order.address}
          <p style="margin: 0; font-weight: bold; font-size: 1.2rem;">{data.order.address.recipient}</p>
          <p style="margin: 0;">{data.order.address.phone}</p>
          <p style="margin: 0.5rem 0 0 0;">{data.order.address.line1}</p>
          <p style="margin: 0;">{data.order.address.district}, {data.order.address.city}</p>
          <p style="margin: 0;">{data.order.address.province}, {data.order.address.postalCode}</p>
        {:else}
          <p>Address missing</p>
        {/if}
      </div>
    </div>

    <!-- ORDER DETAILS -->
    <div style="margin-bottom: 2rem;">
      <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; border-bottom: 1px dashed #000; padding-bottom: 0.5rem;">ORDER DETAILS (ID: #{data.order.id.slice(-8).toUpperCase()})</h3>
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 0.5rem;">
        <thead>
          <tr style="border-bottom: 1px solid #000;">
            <th style="padding: 0.5rem 0;">QTY</th>
            <th style="padding: 0.5rem 0;">PRODUCT</th>
            <th style="padding: 0.5rem 0;">SKU/SIZE</th>
          </tr>
        </thead>
        <tbody>
          {#each data.order.items as item}
            <tr>
              <td style="padding: 0.5rem 0; font-weight: bold;">{item.quantity}x</td>
              <td style="padding: 0.5rem 0;">{item.name || 'Product'}</td>
              <td style="padding: 0.5rem 0;">{item.size || 'M'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- FOOTER BARCODE -->
    <div style="text-align: center; border-top: 2px solid #000; padding-top: 1rem;">
      <div style="font-size: 3rem; font-family: 'Libre Barcode 39 Text', monospace; letter-spacing: 2px;">
        *{data.order.id.slice(-8).toUpperCase()}*
      </div>
      <p style="font-size: 0.8rem; margin: 0.5rem 0 0 0;">Please handle with care. Do not fold this label.</p>
    </div>
  </div>
{:else}
  <div>Order not found.</div>
{/if}
