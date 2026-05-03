# Design Spec: Admin Login UI Redesign (Split Screen)

**Date:** 2026-05-02
**Topic:** Improving the visual appeal of the `admin-web` login page.
**Status:** Approved

## Goal
Transform the basic admin login page into a premium, "Studio-style" experience using a split-screen layout that aligns with the existing project aesthetic (Editorial Bold).

## Visual Direction: Editorial Bold
- **Layout:** Split-screen (approx. 60/40 or 50/50 split).
- **Left Panel (Brand):** Dark/Black background (`#000`), bold white editorial typography.
- **Right Panel (Interaction):** Light/Clean background, minimalist form controls.
- **Consistency:** Reuse `--font-main`, `--input-control`, and `--btn-studio` from `admin.css`.

## Component Mapping
| Element | Existing Class/Style | Modification |
| :--- | :--- | :--- |
| Brand Title | `.editorial-title` | Color: White (inverse) |
| Brand Subtitle | `.editorial-subtitle` | Color: Gray (inverse) |
| Form Input | `.input-control` | Standard usage |
| Login Button | `.btn-studio` | Full width |
| Error Message | `.status-pill.cancelled` | Displayed above inputs |

## Technical Implementation
- **File:** `apps/admin-web/src/routes/login/+page.svelte`
- **Logic:** Preserve existing `handleLogin` and Svelte bindings (`email`, `password`, `error`).
- **Styles:** Move from inline `<style>` to a mix of existing global classes and scoped layout styles.

## Proposed Layout Structure
```svelte
<div class="split-container">
    <div class="brand-side">
        <div class="brand-content">
            <h1 class="editorial-title inverse">ADMIN<br/>STUDIO</h1>
            <p class="editorial-subtitle inverse">CURATED FASHION MANAGEMENT</p>
        </div>
    </div>
    <div class="form-side">
        <div class="form-container">
            <form on:submit|preventDefault={handleLogin}>
                <h2 class="form-heading">Sign In</h2>
                {#if error}
                    <div class="status-pill cancelled">{error}</div>
                {/if}
                <div class="input-group">
                    <span class="input-label">Email Address</span>
                    <input type="email" bind:value={email} class="input-control" required />
                </div>
                <div class="input-group">
                    <span class="input-label">Password</span>
                    <input type="password" bind:value={password} class="input-control" required />
                </div>
                <button type="submit" class="btn-studio full-width">Enter Studio</button>
            </form>
        </div>
    </div>
</div>
```

## Success Criteria
- [ ] Split-screen layout is responsive (stacks on mobile).
- [ ] Design matches the "Studio" aesthetic in `admin.css`.
- [ ] Login functionality remains fully functional.
