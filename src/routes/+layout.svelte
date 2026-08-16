<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from "mode-watcher";
	let { children } = $props();
</script>

<div class="app">
	<ModeWatcher />
	<main>{@render children()}</main>
</div>

<style>
	
</style>
