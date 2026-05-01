# Midtrans-Mirror Admin UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely redesign the `admin-web` dashboard to mirror Midtrans functionality using Novure Storefront styling conventions.

**Architecture:** Update global CSS variables. Implement three main views: Overview (Metrics & Recent Transactions), Orders List (Filterable Table), and Order Detail (Split view: Receipt & Logistics Timeline).

**Tech Stack:** SvelteKit (admin-web), Tailwind-like CSS principles via `app.css`.

---

### Task 1: Update Global Styling & Layout

**Files:**
- Modify: `apps/admin-web/src/app.css`
- Modify: `apps/admin-web/src/routes/+layout.svelte`

- [ ] **Step 1: Update Global CSS Variables**

Replace the contents of `apps/admin-web/src/app.css` with:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --bg-studio: #f9f9f9;
  --white: #ffffff;
  --fg-studio: #111111;
  --sage: #9cad8f;
  --border-radius-pill: 999px;
  --border-radius-card: 1.2rem;
  --font-main: 'Inter', system-ui, sans-serif;
  --container-max: 1200px;
}

body {
  margin: 0;
  background: var(--bg-studio);
  color: var(--fg-studio);
  font-family: var(--font-main);
  -webkit-font-smoothing: antialiased;
}

/* Typography */
.editorial-title {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin: 0;
}

.editorial-subtitle {
  font-size: 0.95rem;
  color: #999;
  font-weight: 500;
  margin-top: 0.8rem;
}

/* Cards & Containers */
.insight-content {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 4rem 2rem;
}

.insight-card {
  background: var(--white);
  border-radius: var(--border-radius-card);
  padding: 2.5rem;
  border: 1px solid #f0f0f0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.02);
  margin-bottom: 2rem;
}

/* Buttons */
.btn-studio {
  display: inline-flex;
  align-items: center;
  padding: 0.8rem 2.2rem;
  background: #000;
  color: #fff;
  border-radius: var(--border-radius-pill);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-studio:hover {
  background: #333;
  transform: translateY(-1px);
}

.btn-studio-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.8rem 2.2rem;
  background: #fff;
  color: #000;
  border-radius: var(--border-radius-pill);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

/* Inputs */
.input-control {
  width: 100%;
  padding: 1.1rem 1.4rem;
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: var(--border-radius-card);
  font-family: var(--font-main);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.input-control:focus {
  border-color: #111;
  outline: none;
}

/* Status Pills */
.status-pill {
  padding: 0.4rem 1rem;
  border-radius: var(--border-radius-pill);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
}
.status-pill.success { background: #dcfce7; color: #15803d; }
.status-pill.pending { background: #fef3c7; color: #92400e; }
.status-pill.cancelled { background: #fee2e2; color: #b91c1c; }
```

- [ ] **Step 2: Update Layout Navbar**

Replace the contents of `apps/admin-web/src/routes/+layout.svelte` with:
```html
<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
</script>

<nav style="display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 4rem; background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; z-index: 100;">
  <a href="/" style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.04em; color: #000; text-decoration: none;">
    NOVURE <span style="color: #9cad8f;">WORKSPACE</span>
  </a>
  <div style="display: flex; gap: 2rem; font-size: 0.85rem; font-weight: 600; color: #888;">
    <a href="/" style="color: {$page.url.pathname === '/' ? '#000' : '#888'}; text-decoration: none; border-bottom: {$page.url.pathname === '/' ? '1.5px solid #000' : 'none'}; padding-bottom: 4px;">Overview</a>
    <a href="/orders" style="color: {$page.url.pathname.startsWith('/orders') ? '#000' : '#888'}; text-decoration: none; border-bottom: {$page.url.pathname.startsWith('/orders') ? '1.5px solid #000' : 'none'}; padding-bottom: 4px;">Transactions</a>
    <a href="/products" style="color: {$page.url.pathname.startsWith('/products') ? '#000' : '#888'}; text-decoration: none; border-bottom: {$page.url.pathname.startsWith('/products') ? '1.5px solid #000' : 'none'}; padding-bottom: 4px;">Products</a>
  </div>
  <div style="display: flex; align-items: center; gap: 1rem;">
    <span style="font-size: 0.8rem; font-weight: 600;">ENV: <span style="background: #f0fdf4; color: #15803d; padding: 0.3rem 0.8rem; border-radius: 999px; margin-left: 0.5rem;">PRODUCTION</span></span>
  </div>
</nav>

<main class="insight-content">
  <slot />
</main>
```

- [ ] **Step 3: Commit Global Styles**

```bash
git add apps/admin-web/src/app.css apps/admin-web/src/routes/+layout.svelte
git commit -m "style(admin-web): update global css and layout to mirror storefront design"
```

---

### Task 2: Implement Overview Page (`/`)

**Files:**
- Modify: `apps/admin-web/src/routes/+page.server.ts`
- Modify: `apps/admin-web/src/routes/+page.svelte`

- [ ] **Step 1: Update Server Load for Overview**

Replace `apps/admin-web/src/routes/+page.server.ts` with:
```typescript
import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const [analyticsRes, ordersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/analytics`),
    fetch(`${API_BASE_URL}/orders?limit=5`) // Assuming backend supports limit, else we slice in UI
  ]);

  const analytics = analyticsRes.ok ? await analyticsRes.json() : { data: null };
  const orders = ordersRes.ok ? await ordersRes.json() : { data: [] };

  return {
    analytics: analytics.data || {
      summary: { totalRevenue: 0, revenueGrowth: 0 },
      finance: { grossProfit: 0 },
      successRate: 100
    },
    recentOrders: (orders.data || []).slice(0, 5)
  };
};
```

- [ ] **Step 2: Update Overview Svelte Template**

Replace `apps/admin-web/src/routes/+page.svelte` with:
```html
<script lang="ts">
  let { data } = $props();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStatusClass(status: string) {
    if (['SHIPPED', 'DELIVERED'].includes(status)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'cancelled';
    return 'pending';
  }
</script>

<div class="hero-header" style="display: flex; justify-content: space-between; align-items: flex-end;">
  <div>
    <h1 class="editorial-title">Business Overview</h1>
    <p class="editorial-subtitle">Real-time transaction and settlement metrics.</p>
  </div>
  <button class="btn-studio">Download Report</button>
</div>

<!-- Metrics -->
<div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Gross Transaction Value (Life)</div>
    <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.02em;">{formatCurrency(data.analytics.summary.totalRevenue)}</div>
    <div style="margin-top: 1rem; font-size: 0.8rem; font-weight: 600; color: #15803d; display: flex; align-items: center; gap: 0.5rem;">
      <span style="background: #dcfce7; padding: 0.2rem 0.5rem; border-radius: 4px;">{data.analytics.summary.revenueGrowth >= 0 ? '↑' : '↓'} {data.analytics.summary.revenueGrowth}%</span> vs last month
    </div>
  </div>
  
  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Net Settlement (Est)</div>
    <div style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">{formatCurrency(data.analytics.finance.grossProfit)}</div>
    <div style="margin-top: 1rem; font-size: 0.8rem; font-weight: 500; color: #888;">Clearing tomorrow at 08:00 AM</div>
  </div>

  <div class="insight-card">
    <div style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">Payment Success Rate</div>
    <div style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em;">{data.analytics.successRate || 100}%</div>
    <div style="width: 100%; height: 4px; background: #eee; border-radius: 2px; margin-top: 1.5rem;">
      <div style="width: {data.analytics.successRate || 100}%; height: 100%; background: #000; border-radius: 2px;"></div>
    </div>
  </div>
</div>

<!-- Transactions Table -->
<div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; overflow: hidden;">
  <div style="padding: 2rem 2.5rem; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
    <h2 style="font-size: 1.2rem; font-weight: 800; margin: 0;">Recent Transactions</h2>
    <a href="/orders" class="btn-studio-secondary" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">View All</a>
  </div>
  
  <table style="width: 100%; text-align: left; border-collapse: collapse;">
    <thead>
      <tr style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em;">
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Order ID</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Customer</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700; text-align: right;">Gross Amount</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Status</th>
      </tr>
    </thead>
    <tbody style="font-size: 0.9rem;">
      {#each data.recentOrders as order}
        <tr style="border-top: 1px solid #f9f9f9; cursor: pointer;" onclick={() => window.location.href=`/orders/${order.id}`}>
          <td style="padding: 1.5rem 2.5rem;">
            <div style="font-weight: 700;">#{order.id.slice(-6).toUpperCase()}</div>
            <div style="font-size: 0.75rem; color: #888; margin-top: 0.3rem;">{new Date(order.createdAt).toLocaleDateString()}</div>
          </td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 500;">{order.customer?.name || 'Guest'}</td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 800; text-align: right;">{formatCurrency(order.totalAmount)}</td>
          <td style="padding: 1.5rem 2.5rem;">
            <span class="status-pill {getStatusClass(order.status)}">{order.status.replace('_', ' ')}</span>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

- [ ] **Step 3: Commit Overview Page**

```bash
git add apps/admin-web/src/routes/+page.server.ts apps/admin-web/src/routes/+page.svelte
git commit -m "feat(admin-web): redesign overview page to mirror midtrans dashboard"
```

---

### Task 3: Implement Transactions Page (`/orders`)

**Files:**
- Modify: `apps/admin-web/src/routes/orders/+page.svelte`

- [ ] **Step 1: Update Orders List Template**

Replace `apps/admin-web/src/routes/orders/+page.svelte` with:
```html
<script lang="ts">
  let { data } = $props();
  let searchQuery = $state('');

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  function getStatusClass(status: string) {
    if (['SHIPPED', 'DELIVERED'].includes(status)) return 'success';
    if (['CANCELLED', 'RETURNED', 'REFUNDED'].includes(status)) return 'cancelled';
    return 'pending';
  }

  let filteredOrders = $derived(
    data.orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="hero-header" style="margin-bottom: 2rem;">
  <h1 class="editorial-title">Transactions</h1>
  <p class="editorial-subtitle">Complete history of all payments and orders.</p>
</div>

<div style="background: #fff; border-radius: 1.2rem; border: 1px solid #f0f0f0; overflow: hidden;">
  <div style="padding: 2rem 2.5rem; border-bottom: 1px solid #f0f0f0; display: flex; gap: 1rem;">
    <input type="text" bind:value={searchQuery} placeholder="Search Order ID or Customer Name..." style="padding: 0.8rem 1.5rem; border-radius: 999px; border: 1px solid #eee; background: #fafafa; font-size: 0.9rem; flex: 1; font-family: inherit;" />
  </div>
  
  <table style="width: 100%; text-align: left; border-collapse: collapse;">
    <thead>
      <tr style="font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.05em;">
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Order ID</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Customer</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700; text-align: right;">Gross Amount</th>
        <th style="padding: 1.5rem 2.5rem; font-weight: 700;">Status</th>
      </tr>
    </thead>
    <tbody style="font-size: 0.9rem;">
      {#each filteredOrders as order}
        <tr style="border-top: 1px solid #f9f9f9; cursor: pointer; transition: background 0.2s;" onmouseover={e => e.currentTarget.style.background='#fcfcfc'} onmouseout={e => e.currentTarget.style.background='transparent'} onclick={() => window.location.href=`/orders/${order.id}`}>
          <td style="padding: 1.5rem 2.5rem;">
            <div style="font-weight: 700;">#{order.id.slice(-6).toUpperCase()}</div>
            <div style="font-size: 0.75rem; color: #888; margin-top: 0.3rem;">{new Date(order.createdAt).toLocaleString()}</div>
          </td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 500;">{order.customer?.name || 'Guest'}</td>
          <td style="padding: 1.5rem 2.5rem; font-weight: 800; text-align: right;">{formatCurrency(order.totalAmount)}</td>
          <td style="padding: 1.5rem 2.5rem;">
            <span class="status-pill {getStatusClass(order.status)}">{order.status.replace('_', ' ')}</span>
          </td>
        </tr>
      {/each}
      {#if filteredOrders.length === 0}
        <tr>
          <td colspan="4" style="padding: 3rem; text-align: center; color: #888; font-weight: 500;">No transactions found.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Commit Transactions Page**

```bash
git add apps/admin-web/src/routes/orders/+page.svelte
git commit -m "feat(admin-web): redesign transactions list page"
```

---

### Task 4: Implement Order Detail & Logistics Timeline (`/orders/[id]`)

**Files:**
- Modify: `apps/admin-web/src/routes/orders/[id]/+page.server.ts`
- Modify: `apps/admin-web/src/routes/orders/[id]/+page.svelte`

- [ ] **Step 1: Update Server Load to include Carriers & Tracking**

Replace `apps/admin-web/src/routes/orders/[id]/+page.server.ts` with:
```typescript
import { API_BASE_URL } from '$lib/config';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const MANAGEMENT_API_URL = API_BASE_URL.replace('/storefront', '/management');

export const load: PageServerLoad = async ({ params, fetch }) => {
  const [orderRes, carriersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/orders/${params.id}`),
    fetch(`${MANAGEMENT_API_URL}/shipping/carriers`)
  ]);
  
  if (!orderRes.ok) {
    return { order: null, carriers: [], tracking: null };
  }
  
  const orderData = await orderRes.json();
  const carriersData = carriersRes.ok ? await carriersRes.json() : { data: [] };

  let tracking = null;
  if (['SHIPPED', 'DELIVERED'].includes(orderData.data.status)) {
    const trackRes = await fetch(`${API_BASE_URL.replace('/admin/storefront', '/storefront')}/shipping/track/${params.id}`);
    if (trackRes.ok) {
      const trackData = await trackRes.json();
      tracking = trackData.data;
    }
  }

  return {
    order: orderData.data,
    carriers: carriersData.data,
    tracking
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, params, fetch }) => {
    const data = await request.formData();
    const status = data.get('status');
    const res = await fetch(`${API_BASE_URL}/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) return fail(res.status, { message: 'Failed to update' });
    return { success: true };
  },
  initTracking: async ({ request, params, fetch }) => {
    const data = await request.formData();
    const carrierId = data.get('carrierId');
    const trackingNumber = data.get('trackingNumber');
    
    const res = await fetch(`${MANAGEMENT_API_URL}/shipping/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: params.id, carrierId, trackingNumber })
    });
    
    if (!res.ok) return fail(res.status, { message: 'Failed to init tracking' });
    return { success: true };
  },
  addLog: async ({ request, fetch }) => {
    const data = await request.formData();
    const trackingId = data.get('trackingId');
    const status = data.get('status');
    const location = data.get('location');
    const description = data.get('description');

    const res = await fetch(`${MANAGEMENT_API_URL}/shipping/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId, status, location, description })
    });
    if (!res.ok) return fail(res.status, { message: 'Failed to add log' });
    return { success: true };
  }
};
```

- [ ] **Step 2: Update Order Detail Svelte Template (Receipt & Timeline)**

Replace `apps/admin-web/src/routes/orders/[id]/+page.svelte` with:
```html
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
```

- [ ] **Step 3: Commit Order Detail Page**

```bash
git add apps/admin-web/src/routes/orders/[id]/+page.server.ts apps/admin-web/src/routes/orders/[id]/+page.svelte
git commit -m "feat(admin-web): redesign order detail page with logistics timeline"
```
