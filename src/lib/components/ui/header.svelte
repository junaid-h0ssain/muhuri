<script lang="ts">
    import { enhance } from "$app/forms";
    import Button from "./button/button.svelte";
    import ModeToggle from "./ModeToggle.svelte";
    import { page } from "$app/state";
</script>

<header class="flex justify-between items-center w-full border-b px-6 py-3 bg-background">
    <div class="text-2xl font-bold">
        <a href="/">Muhuri</a>
    </div>
    <div class="flex flex-row items-center gap-3">
        {#if page.data.user}
            <span class="text-sm font-medium">Hi, {page.data.user.name || page.data.user.email}</span>
            <form method="post" action="/auth/sign-out" use:enhance>
                <Button variant="outline" type="submit">Sign Out</Button>
            </form>
        {:else}
            <Button variant="outline" href="/auth/login">Login</Button>
            <Button href="/auth/sign-up">Sign Up</Button>
        {/if}
        <ModeToggle />
    </div>
</header>
