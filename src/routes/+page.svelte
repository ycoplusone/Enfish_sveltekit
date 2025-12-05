<!-- root / page -->

<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/test'); // 이동하고 싶은 URL로 변경
	});
</script>

<p>Redirecting...</p>





