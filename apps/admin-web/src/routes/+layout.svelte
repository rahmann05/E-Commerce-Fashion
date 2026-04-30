<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	let { children } = $props();

	const navItems = [
		{ name: 'Dashboard', path: '/' },
		{ name: 'Catalogue', path: '/products' },
		{ name: 'Collections', path: '/categories' },
		{ name: 'Orders', path: '/orders' },
		{ name: 'Intelligence', path: '/analytics' }
	];
</script>

<nav class="studio-nav">
	<div class="nav-container">
		<div class="nav-links left">
			{#each navItems.slice(0, 3) as item}
				<a 
					href={item.path} 
					class="nav-item {page.url.pathname === item.path ? 'active' : ''}"
				>
					{item.name}
				</a>
			{/each}
		</div>

		<div class="nav-brand">
			<a href="/">Novure</a>
		</div>

		<div class="nav-links right">
			{#each navItems.slice(3) as item}
				<a 
					href={item.path} 
					class="nav-item {page.url.pathname === item.path ? 'active' : ''}"
				>
					{item.name}
				</a>
			{/each}
			<div class="user-avatar">
				R
			</div>
		</div>
	</div>
</nav>

<main class="studio-content">
	{@render children()}
</main>

<style>
	.studio-nav {
		position: sticky;
		top: 0;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		z-index: 1000;
		padding: 1.5rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.03);
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 4rem;
	}

	.nav-brand a {
		font-size: 1.8rem;
		font-weight: 900;
		letter-spacing: -0.06em;
		color: #000;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 3.5rem;
		align-items: center;
		flex: 1;
	}

	.nav-links.right {
		justify-content: flex-end;
	}

	.nav-item {
		font-size: 0.65rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #aaa;
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
	}

	.nav-item:hover, .nav-item.active {
		color: #000;
	}

	.nav-item.active::after {
		content: '';
		position: absolute;
		bottom: -1.5rem;
		left: 0;
		width: 100%;
		height: 2px;
		background: #000;
	}

	.user-avatar {
		width: 35px;
		height: 35px;
		background: #000;
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 900;
		margin-left: 1.5rem;
	}

	.studio-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 6rem 4rem;
	}

	@media (max-width: 1024px) {
		.nav-container { padding: 0 2rem; }
		.nav-links { gap: 1.5rem; }
		.studio-content { padding: 4rem 2rem; }
	}
</style>
