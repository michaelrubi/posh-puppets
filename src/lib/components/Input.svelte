<script lang="ts">
	interface Props {
		label: string;
		id: string;
		type?: 'text' | 'email' | 'password';
		value: string;
	}

	let { label, id, type = 'text', value = $bindable() }: Props = $props();
</script>

<div class="input-wrapper">
	<input {type} {id} bind:value placeholder=" " />
	<label for={id}>{label}</label>
</div>

<style>
	.input-wrapper {
		position: relative;
		width: 100%;
	}

	input {
		--x-padding: 0.75rem;
		font-size: 1rem;
		width: 100%;
		max-width: calc(600px - var(--x-padding) * 2);
		padding: 1.25rem var(--x-padding) 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--color-surface-300);
		background-color: var(--color-surface-100, #2c2c2e);
		color: var(--color-text, #e0e0e0);
		transition: border-color 0.2s ease;
	}

	/* Style the label */
	label {
		position: absolute;
		top: 0.85rem;
		left: 0.75rem;
		font-size: 1rem;
		color: var(--color-text-muted, #8e8e93);
		/* Prevents the label from blocking clicks on the input */
		pointer-events: none;
		transition: all 0.2s ease-in-out;
	}

	/* When the input is focused, change its border color */
	input:focus {
		outline: none;
		border-color: var(--color-primary, #007bff);
	}

	/*
	* When the input is focused OR has a value, move the label up.
	* We use :not(:placeholder-shown) to detect when the input has text.
	*/
	input:focus + label,
	input:not(:placeholder-shown) + label {
		top: 0.25rem;
		font-size: 0.75rem;
		color: var(--color-primary, #007bff);
	}
</style>
