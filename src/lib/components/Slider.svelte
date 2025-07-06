<script lang="ts">
	interface Props {
		value: number;
		min?: number;
		max?: number;
		unit?: string;
		disabled: boolean;
	}

	let { value = $bindable(), min = 1, max = 20, unit = 'user', disabled }: Props = $props();
</script>

<div class="slider">
	<span>{value} {`${unit}${value === 1 ? '' : 's'}`}</span>
	<input type="range" {min} {max} bind:value {disabled} />
</div>

<style>
	.slider {
		display: grid;
		width: 100%;

		input {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			background: var(--color-primary);
			cursor: pointer;
			height: 25%;
			border-radius: 1rem;
		}

		input:focus {
			outline: none;
		}
	}
</style>
