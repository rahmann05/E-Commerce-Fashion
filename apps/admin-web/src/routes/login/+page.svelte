<script lang="ts">
    import { INTERNAL_API_URL } from '$lib/config';

    let email = '';
    let password = '';
    let error = '';

    async function handleLogin(e: Event) {
        e.preventDefault();
        error = '';

        try {
            const res = await fetch(`${INTERNAL_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                window.location.href = '/';
            } else {
                const data = await res.json();
                error = data.error || 'Login failed';
            }
        } catch (err) {
            error = 'Network error during login';
        }
    }
</script>

<div class="login-container">
    <form on:submit={handleLogin} class="login-form">
        <h2>Admin Login</h2>
        {#if error}
            <div class="error-msg">{error}</div>
        {/if}
        <label>
            Email:
            <input type="email" bind:value={email} required />
        </label>
        <label>
            Password:
            <input type="password" bind:value={password} required />
        </label>
        <button type="submit">Login</button>
    </form>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f4f9;
    }
    .login-form {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }
    .login-form h2 { margin-top: 0; }
    .error-msg { color: red; margin-bottom: 1rem; }
    label { display: block; margin-bottom: 1rem; }
    input { width: 100%; padding: 0.5rem; margin-top: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    button { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0056b3; }
</style>