<script lang="ts">
    import ModeToggle from "$lib/components/ui/ModeToggle.svelte";


</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<header>
		<ModeToggle/>
	</header>
	Hello world

	<footer>
		<a href="/demo/better-auth/login"> path to login demo</a>
	</footer>
</div>

<style>
	
</style>
