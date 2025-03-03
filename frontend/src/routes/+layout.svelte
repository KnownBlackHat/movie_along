<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="h-screen w-screen bg-black font-serif text-white">
	{@render children()}
</div>
