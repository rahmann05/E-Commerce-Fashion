# Enterprise Automation: Midtrans Webhook & Supabase Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Midtrans Webhook handler for automated payment status updates and standardize image uploads using direct Supabase Storage.

**Architecture:** Add a new webhook endpoint in `admin-service` with SHA512 signature verification. Update the API Gateway proxy configuration. Standardize `UploadImage.svelte` in `admin-web` to use Supabase only.

**Tech Stack:** SvelteKit (admin-service/admin-web), Express (Gateway), Prisma, Neon, Supabase Storage.

---

### Task 1: Update API Gateway Routing

**Files:**
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Add Midtrans notification proxy route**

Add the notification route to the `admin-service` proxy groups in `services/api-gateway/index.ts`. It should be placed in the transaction group or as a standalone specific route.

```typescript
// Add to the existing admin-service proxy group or as a new one
app.use(createProxyMiddleware({
  pathFilter: [
    '/api/storefront/auth',
    '/api/storefront/account',
    '/api/storefront/cart',
    '/api/storefront/checkout', // This will now include /checkout/midtrans/notification
    '/api/storefront/orders',
    '/api/storefront/shipping'
  ],
  ...proxyOptions(ADMIN_BACKEND_URL)
}));
```
Actually, looking at the current `index.ts`, `/api/storefront/checkout` is already proxied. Let's ensure `/api/storefront/checkout/midtrans/notification` is explicitly included if not already covered by prefix matching.

- [ ] **Step 2: Verify Gateway builds**

Run: `cd services/api-gateway && npm run build`
Expected: Successful build.

- [ ] **Step 3: Commit Gateway changes**

```bash
git add services/api-gateway/index.ts
git commit -m "feat(gateway): ensure midtrans notification route is proxied to admin-service"
```

---

### Task 2: Implement Midtrans Webhook Handler (admin-service)

**Files:**
- Create: `services/admin-service/src/routes/api/storefront/checkout/midtrans/notification/+server.ts`

- [ ] **Step 1: Create the Webhook endpoint with signature verification**

File: `services/admin-service/src/routes/api/storefront/checkout/midtrans/notification/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '@infrastructure/database/prisma';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status,
      payment_type
    } = body;

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hashed = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (hashed !== signature_key) {
      return json({ success: false, message: 'Invalid signature' }, { status: 403 });
    }

    // 2. Map status
    let orderStatus: 'PROCESSING' | 'CANCELLED' | 'AWAITING_PAYMENT' = 'AWAITING_PAYMENT';
    
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      orderStatus = 'PROCESSING';
    } else if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
      orderStatus = 'CANCELLED';
    }

    // 3. Update Order and create Audit Log
    if (orderStatus !== 'AWAITING_PAYMENT') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order_id },
          data: { status: orderStatus }
        });

        // Optional: Add to AuditLog if it exists in your schema
        // await tx.auditLog.create({ ... })
      });
    }

    return json({ success: true, message: 'Notification processed' });
  } catch (error) {
    console.error('MIDTRANS_WEBHOOK_ERROR', error);
    return json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
};
```

- [ ] **Step 2: Commit Webhook implementation**

```bash
git add services/admin-service/src/routes/api/storefront/checkout/midtrans/notification/+server.ts
git commit -m "feat(admin-api): implement midtrans webhook handler with signature verification"
```

---

### Task 3: Standardize Supabase Storage Component (admin-web)

**Files:**
- Modify: `apps/admin-web/src/lib/components/UploadImage.svelte`

- [ ] **Step 1: Cleanup and Standardize UploadImage**

Ensure the component only uses Supabase and handles public URL generation correctly.

```svelte
// apps/admin-web/src/lib/components/UploadImage.svelte
<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let bucket = 'products';
	export let folder = 'images';
	export let label = 'Upload Image';
	export let initialImage = '';

	let uploading = false;
	let previewUrl = initialImage;
	let fileInput: HTMLInputElement;

	async function handleUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			uploading = true;
			
			// Show local preview immediately
			previewUrl = URL.createObjectURL(file);

			const fileExt = file.name.split('.').pop();
			const fileName = `${crypto.randomUUID()}.${fileExt}`;
			const filePath = `${folder}/${fileName}`;

			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(filePath, file);

			if (error) throw error;

			const { data: { publicUrl } } = supabase.storage
				.from(bucket)
				.getPublicUrl(filePath);

			dispatch('upload', { url: publicUrl });
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Error uploading image. Make sure the bucket exists and is public.');
		} finally {
			uploading = false;
		}
	}
</script>

<div class="upload-editorial">
	<span class="input-label" style="font-size: 0.75rem; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 0.5rem; display: block;">{label}</span>
	
	<div class="preview-container" class:has-image={!!previewUrl} style="position: relative; width: 100%; aspect-ratio: 16/9; background: #fafafa; border-radius: 1.2rem; border: 1.5px dashed #eee; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
		{#if previewUrl}
			<img src={previewUrl} alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />
		{:else}
			<div class="upload-placeholder" style="text-align: center; color: #ccc;">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
				<p style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-top: 0.5rem;">Upload Image</p>
			</div>
		{/if}
		
		<button 
			type="button" 
			class="trigger-btn" 
			onclick={() => fileInput.click()}
			disabled={uploading}
			style="position: absolute; background: #fff; border: 1px solid #eee; padding: 0.5rem 1.2rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.05);"
		>
			{uploading ? 'Uploading...' : 'Choose File'}
		</button>
	</div>

	<input
		type="file"
		accept="image/*"
		bind:this={fileInput}
		onchange={handleUpload}
		hidden
	/>
</div>
```

- [ ] **Step 2: Commit Storage Component**

```bash
git add apps/admin-web/src/lib/components/UploadImage.svelte
git commit -m "feat(admin-web): standardize UploadImage component using Supabase Storage"
```

---

### Task 4: Integrate Storage into Product/Category Forms

**Files:**
- Modify: `apps/admin-web/src/routes/products/new/+page.svelte`
- Modify: `apps/admin-web/src/routes/categories/new/+page.svelte`
- Modify: `apps/admin-web/src/routes/products/[id]/+page.svelte`

- [ ] **Step 1: Update Product Forms**

Ensure they use the `UploadImage` component and bind the result to a hidden input or state variable that is sent during form submission.

Example update for `apps/admin-web/src/routes/products/new/+page.svelte`:
```svelte
<script lang="ts">
  import UploadImage from '$lib/components/UploadImage.svelte';
  let imageUrl = $state('');
</script>

<form method="POST" ...>
  <UploadImage bucket="products" folder="items" on:upload={(e) => imageUrl = e.detail.url} />
  <input type="hidden" name="image" value={imageUrl} />
  <!-- ... rest of form ... -->
</form>
```

- [ ] **Step 2: Update Category Forms**

Similar update for `apps/admin-web/src/routes/categories/new/+page.svelte`.

- [ ] **Step 3: Commit Form Integrations**

```bash
git add apps/admin-web/src/routes/products/ apps/admin-web/src/routes/categories/
git commit -m "feat(admin-web): integrate Supabase image upload into product and category forms"
```
