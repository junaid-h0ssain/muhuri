<script lang="ts">
	import LoginForm from "$lib/components/login-form.svelte";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="w-full max-w-sm md:max-w-3xl">
		<LoginForm {form} />
	</div>
</div>
