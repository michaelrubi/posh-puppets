<script lang="ts">
	interface Props {
		label: string;
		id: string;
		value: boolean;
	}

	let { label, id, value = $bindable() }: Props = $props();
</script>

<div class="toggle-wrapper">
	<label for={id} class="toggle-label">{label}</label>
	<label class="switch" for={id}>
		<input type="checkbox" {id} bind:checked={value} />
		<span class="slider"></span>
	</label>
</div>

<style>
	.toggle-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
	}
	.toggle-label {
		font-weight: 500;
		color: var(--color-text);
		cursor: pointer;
	}
	.switch {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 28px;
		flex-shrink: 0;
	}
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-surface-300);
		transition: 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
		border-radius: 34px;
	}
	.slider:before {
		position: absolute;
		content: '';
		height: 20px;
		width: 20px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	input:checked + .slider {
		background-color: var(--color-primary);
	}
	input:checked + .slider:before {
		transform: translateX(22px);
	}
</style>
