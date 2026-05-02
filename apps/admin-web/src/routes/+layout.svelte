<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  
  const mode = import.meta.env?.MODE || 'PRODUCTION';
</script>

{#if $page.url.pathname === '/login'}
  <slot />
{:else}
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
      <a href="/api/logout" class="logout-btn" data-sveltekit-preload-data="off">Logout</a>
    </div>
  </nav>

  <main class="insight-content">
    <slot />
  </main>
{/if}

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

  .logout-btn {
    display: inline-block;
    text-decoration: none;
    background: transparent;
    border: 1px solid #ff4d4f;
    color: #ff4d4f;
    padding: 0.3rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 1.5rem;
  }

  .logout-btn:hover {
    background: #ff4d4f;
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
  }
</style>
