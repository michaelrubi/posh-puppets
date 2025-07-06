<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import Slider from '$lib/components/Slider.svelte';
	import Toggle from '$lib/components/Toggle.svelte';

	let showUrl = $state('');
	let showWindow = $state(false);
	let isLoading = $state(false);
	let serverResponse = $state('');
	let count = $state(1);

	async function runBatchAutomation() {
		isLoading = true;
		serverResponse = 'Sending request to start batch...';

		try {
			const response = await fetch('/api/show', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ showUrl, count, showWindow })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message);
			}

			serverResponse = result.message;
		} catch (error: any) {
			serverResponse = `Error: ${error.message}`;
			isLoading = false;
		}
	}
</script>

<main>
	<h1>Poshmark Automation Control</h1>

	<Input label="Show Link" id="showUrl" bind:value={showUrl} />

	<Toggle label="Show Browser Window?" id="showWindow" bind:value={showWindow} />

	<Slider bind:value={count} disabled={isLoading} />

	<button onclick={runBatchAutomation} disabled={isLoading}>
		{isLoading ? (serverResponse ? '🎭 In Show' : '🤖 Starting...') : 'Join Show'}
	</button>

	{#if serverResponse}
		<pre class="response">{serverResponse} for {count} user{count == 1 ? '' : 's'}</pre>
	{/if}
</main>

<style>
	:global(body) {
		/* Modern Dark Color Palette */
		--color-primary: #7f0353;
		--color-text: #e0e0e0;
		--color-text-muted: #8e8e93;
		--color-background: #1c1c1e;
		--color-surface-100: #2c2c2e;
		--color-surface-300: #48484a;

		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		background-color: var(--color-background);
		color: var(--color-text);
		display: grid;
		place-items: center;
		min-height: 100vh;
		margin: 0;
	}
	main {
		max-width: 600px;
		font-family: sans-serif;
		display: grid;
		gap: 1rem;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		border-radius: 4px;
		border: none;
		background-color: var(--color-primary);
		color: white;
		font-size: 1rem;
		cursor: pointer;
	}
	button:disabled {
		background-color: #aaa;
	}
	.response {
		margin-top: 1.5rem;
		padding: 1rem;
		border-radius: 4px;
		white-space: pre-wrap;
	}
</style>
