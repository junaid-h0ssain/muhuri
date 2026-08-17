<script lang="ts">
	import SignupForm from "$lib/components/signup-form.svelte";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
	<div class="w-full max-w-sm md:max-w-4xl">
		<SignupForm {form} />
	</div>
</div>
