<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }
</script>

<div class="hero-header" style="margin-bottom: 2rem;">
  <h1 class="editorial-title">Return & Resolution Center</h1>
  <p class="editorial-subtitle">Manage customer return requests and refunds.</p>
</div>

{#if form?.message}
  <div style="padding: 1rem; background: #fee2e2; color: #b91c1c; border-radius: 0.5rem; margin-bottom: 1rem;">
    {form.message}
  </div>
{/if}

{#if data.returns.length === 0}
  <div style="text-align: center; padding: 4rem; background: white; border-radius: 1rem; border: 1px solid #eee;">
    <p style="color: #666;">No return requests at the moment.</p>
  </div>
{:else}
  <div style="display: grid; gap: 1.5rem;">
    {#each data.returns as req}
      <div style="background: white; border-radius: 1rem; border: 1px solid #eee; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Order #{req.orderId.slice(-8).toUpperCase()}</h3>
            <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">Requested on {new Date(req.createdAt).toLocaleString()}</p>
          </div>
          <span class="status-pill" class:pending={req.status === 'PENDING'} class:success={req.status === 'APPROVED'} class:cancelled={req.status === 'REJECTED'} style="font-size: 0.8rem; padding: 0.4rem 0.8rem; border-radius: 999px;">
            {req.status}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
          <div>
            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #888; margin: 0 0 0.5rem 0;">Reason for Return</h4>
            <p style="margin: 0; font-weight: 500;">{req.reason}</p>
            
            {#if req.images && req.images.length > 0}
              <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                {#each req.images as img}
                  <a href={img} target="_blank">
                    <img src={img} alt="Return Proof" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem; border: 1px solid #ddd;" />
                  </a>
                {/each}
              </div>
            {/if}
          </div>

          <div style="background: #fafafa; padding: 1rem; border-radius: 0.5rem;">
            <h4 style="font-size: 0.85rem; text-transform: uppercase; color: #888; margin: 0 0 0.5rem 0;">Order Items</h4>
            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.9rem;">
              {#each req.order.items as item}
                <li>{item.quantity}x {item.name || 'Product'} - {formatCurrency(item.price)}</li>
              {/each}
            </ul>
            <div style="margin-top: 1rem; font-weight: 700;">
              Total Order Value: {formatCurrency(req.order.totalAmount)}
            </div>
          </div>
        </div>

        {#if req.status === 'PENDING'}
          <div style="display: flex; gap: 1rem; justify-content: flex-end; border-top: 1px solid #eee; padding-top: 1rem; margin-top: 0.5rem;">
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="id" value={req.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button type="submit" class="btn-studio" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 0.5rem 1.5rem;">Reject Return</button>
            </form>
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="id" value={req.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button type="submit" class="btn-studio" style="background: #10b981; color: white; padding: 0.5rem 1.5rem;">Approve & Refund</button>
            </form>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
