<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  
  const mode = import.meta.env?.MODE || 'PRODUCTION';
</script>

<nav class="noveru-navbar">
  <a href="/" class="nav-brand">
    NOVURE <span class="nav-brand-highlight">WORKSPACE</span>
  </a>
  <div class="nav-links">
    <a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>Overview</a>
    <a href="/orders" class="nav-link" class:active={$page.url.pathname.startsWith('/orders')}>Transactions</a>
    <a href="/products" class="nav-link" class:active={$page.url.pathname.startsWith('/products')}>Products</a>
  </div>
  <div class="nav-env">
    <span class="env-label">ENV: <span class="env-badge">{mode.toUpperCase()}</span></span>
  </div>
</nav>

<main class="insight-content">
  <slot />
</main>

<style>
  .noveru-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 4rem;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-brand {
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #000;
    text-decoration: none;
  }

  .nav-brand-highlight {
    color: #9cad8f;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .nav-link {
    color: #888;
    text-decoration: none;
    border-bottom: none;
    padding-bottom: 4px;
  }

  .nav-link.active {
    color: #000;
    border-bottom: 1.5px solid #000;
  }

  .nav-env {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .env-label {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .env-badge {
    background: #f0fdf4;
    color: #15803d;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    margin-left: 0.5rem;
  }
</style>
