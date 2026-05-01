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