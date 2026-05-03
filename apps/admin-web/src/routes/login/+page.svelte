<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form } = $props<{ form: ActionData }>();
</script>

<div class="login-wrapper">
    <div class="split-container">
        <div class="brand-side">
            <div class="brand-content">
                <h1 class="editorial-title inverse">ADMIN<br/>STUDIO</h1>
                <p class="editorial-subtitle inverse">CURATED FASHION MANAGEMENT</p>
            </div>
        </div>
        <div class="form-side">
            <div class="form-container">
                <form 
                    action="/login"
                    method="POST" 
                    use:enhance
                >
                    <h2 class="form-heading">Sign In</h2>
                    {#if form?.error}
                        <div class="status-pill cancelled">{form.error}</div>
                    {/if}

                    <div class="input-group-layout">
                        <span class="input-label">Email Address</span>
                        <input 
                            name="email"
                            type="email" 
                            class="input-control" 
                            placeholder="Email Address" 
                            required 
                        />
                    </div>

                    <div class="input-group-layout">
                        <span class="input-label">Password</span>
                        <input 
                            name="password"
                            type="password" 
                            class="input-control" 
                            placeholder="Password" 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        class="btn-studio full-width"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #0a0a0a;
        font-family: 'Inter', sans-serif;
    }

    .login-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background: radial-gradient(circle at 20% 20%, #1a1a1a 0%, #000000 100%);
        position: relative;
        overflow: hidden;
    }

    .login-wrapper::before {
        content: '';
        position: absolute;
        width: 150%;
        height: 150%;
        background: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070') center/cover no-repeat;
        opacity: 0.15;
        filter: grayscale(100%) contrast(120%);
        animation: slow-pan 60s infinite alternate linear;
    }

    @keyframes slow-pan {
        from { transform: scale(1) translate(0, 0); }
        to { transform: scale(1.1) translate(-5%, -5%); }
    }

    .split-container {
        display: flex;
        height: 600px;
        width: 1000px;
        position: relative;
        z-index: 10;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 2.5rem;
        overflow: hidden;
        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
        animation: card-appear 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes card-appear {
        from { opacity: 0; transform: translateY(30px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .brand-side {
        flex: 1.2;
        background: linear-gradient(135deg, #000 0%, #111 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 5rem;
        color: #fff;
        position: relative;
    }

    .brand-side::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 50%);
    }

    .brand-content {
        position: relative;
        z-index: 2;
    }

    .editorial-title.inverse {
        color: #fff;
        font-size: 4.5rem;
        margin-bottom: 1.5rem;
        line-height: 0.9;
        font-weight: 900;
        letter-spacing: -0.06em;
    }

    .editorial-subtitle.inverse {
        color: var(--sage);
        font-size: 0.9rem;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        font-weight: 700;
    }

    .form-side {
        flex: 1;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4rem;
    }

    .form-container {
        width: 100%;
        max-width: 340px;
    }

    .form-heading {
        font-size: 2.2rem;
        font-weight: 900;
        letter-spacing: -0.05em;
        margin-bottom: 2.5rem;
        color: #000;
    }

    .input-group-layout {
        margin-bottom: 1.8rem;
    }

    .input-label {
        display: block;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 0.6rem;
        color: #888;
    }

    .input-control {
        border-radius: 1rem !important;
        background: #f8f9fa !important;
        border: 2px solid transparent !important;
        padding: 1.2rem !important;
        transition: all 0.3s ease !important;
    }

    .input-control:focus {
        background: #fff !important;
        border-color: #000 !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
    }

    .btn-studio.full-width {
        width: 100%;
        padding: 1.2rem;
        font-size: 1rem;
        letter-spacing: 0.05em;
        margin-top: 2rem;
        border-radius: 1rem;
        background: #000;
        color: #fff;
        font-weight: 800;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-studio.full-width:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        background: #222;
    }

    .status-pill.cancelled {
        width: 100%;
        text-align: center;
        margin-bottom: 2rem;
        border-radius: 0.8rem;
        padding: 1rem;
    }

    @media (max-width: 900px) {
        .split-container {
            flex-direction: column;
            width: 90vw;
            height: auto;
            max-height: 95vh;
        }
        .brand-side {
            padding: 3rem;
            flex: none;
            height: 30vh;
        }
        .editorial-title.inverse {
            font-size: 2.5rem;
        }
        .form-side {
            padding: 3rem;
        }
    }
</style>