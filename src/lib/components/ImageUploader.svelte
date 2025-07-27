<script lang="ts">
	import { onMount } from 'svelte';

	export let initialUrl: string | null | undefined = undefined;
	let previewUrl: string | null | undefined = initialUrl;
	let fileInput: HTMLInputElement;

	function handleFileSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			previewUrl = URL.createObjectURL(file);
		}
	}
</script>

<div class="rounded-lg border-2 border-dashed p-4 text-center">
	{#if previewUrl}
		<img src={previewUrl} alt="Preview" class="mx-auto max-h-48 rounded" />
	{/if}

	<div class="mt-2">
		<label for="cover-image-file" class="cursor-pointer text-blue-500 hover:underline">
			{#if previewUrl}Ganti Gambar{:else}Pilih Gambar Sampul{/if}
		</label>
		<input
			id="cover-image-file"
			name="cover_image_file"
			type="file"
			class="hidden"
			accept="image/png, image/jpeg, image/gif"
			on:change={handleFileSelected}
			bind:this={fileInput}
		/>
	</div>
</div>
