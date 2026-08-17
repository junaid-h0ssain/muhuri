<script lang="ts">
    import Header from '$lib/components/ui/header.svelte';
	import './layout.css';
	import { ModeWatcher } from "mode-watcher";
	let { children } = $props();
</script>

<div class="app">
	<ModeWatcher />
	<Header/>
	<main>{@render children()}</main>
</div>

<style>
	
</style>
