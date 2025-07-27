<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Swal from 'sweetalert2';
	import type { ActionData } from '../../routes/dashboard/posts/new/$types';
	import type { Post } from '../../types';
	import ImageUploader from './ImageUploader.svelte';

	export let form: ActionData;
	export let post: Post | null = null;

	// Variabel untuk menampung nilai input, diisi dari 'post' (untuk edit) atau 'form' (jika ada error validasi)
	let title = post?.title ?? form?.title ?? '';
	let slug = post?.slug ?? form?.slug ?? '';
	let content = post?.content ?? form?.content ?? '';

	// Fungsi untuk mengubah teks menjadi format slug
	function slugify(text: string) {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-') // Ganti spasi dengan -
			.replace(/[^\w-]+/g, '') // Hapus karakter yang tidak valid
			.replace(/--+/g, '-'); // Ganti -- ganda dengan - tunggal
	}

	// Slug akan otomatis ter-update saat judul diketik
	$: slug = slugify(title);
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	class="space-y-4 bg-white p-6 rounded-lg shadow-md"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				const successMessage = post ? 'Postingan Anda telah diperbarui.' : 'Postingan Anda telah dipublikasikan.';
				await Swal.fire({
					title: 'Berhasil!',
					text: successMessage,
					icon: 'success',
					timer: 2000,
					showConfirmButton: false
				});
				goto('/dashboard');
			} else if (result.type === 'failure' && result.data?.error) {
				await Swal.fire({
					title: 'Gagal!',
					text: result.data.error,
					icon: 'error'
				});
			}
		};
	}}
>
	<ImageUploader initialUrl={post?.cover_image_url} />

	<div>
		<label for="title" class="block text-sm font-medium text-gray-700">Judul</label>
		<input type="text" name="title" id="title" class="mt-1 w-full" bind:value={title} required />
	</div>
	<div>
		<label for="slug" class="block text-sm font-medium text-gray-700">Slug (untuk URL)</label>
		<input type="text" name="slug" id="slug" class="mt-1 w-full" bind:value={slug} required />
	</div>
	<div>
		<label for="content" class="block text-sm font-medium text-gray-700">Konten</label>
		<textarea
			name="content"
			id="content"
			rows="10"
			class="mt-1 w-full"
			required
			bind:value={content}></textarea>
	</div>

	<div class="flex gap-4">
		{#if post}
			<button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
				Simpan Perubahan
			</button>
			<a href="/dashboard" class="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
				Batal
			</a>
		{:else}
			<button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
				Publikasikan
			</button>
		{/if}
	</div>
</form>