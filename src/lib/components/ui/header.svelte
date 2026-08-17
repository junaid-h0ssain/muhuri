<script lang="ts">
    import Button from "./button/button.svelte";
    import ModeToggle from "./ModeToggle.svelte";
</script>

<header class="flex justify-between w-full border-2 border-amber-50">
    <div class="text-3xl font-bold p-4">
        <a href="/">Muhuri</a>
    </div>
    <div class="flex flex-row p-4">
        <div class="mr-2">
            <Button>
                <a href="/auth/login">Login</a>
            </Button>
        </div>
        <div class="mr-2">
            <Button>
                <a href="/auth/sign-up">Sign Up</a>
            </Button>
        </div>
        <ModeToggle />
    </div>
</header>
