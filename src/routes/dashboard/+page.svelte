<script lang="ts">
	import Swal from 'sweetalert2';
	import type { PageData } from './$types';
	export let data;

	async function confirmDelete(event: Event & { currentTarget: HTMLFormElement }) {
		event.preventDefault(); // Mencegah form submit secara langsung

		// Simpan referensi form SEBELUM await
		const form = event.currentTarget;

		const result = await Swal.fire({
			title: 'Apakah Anda yakin?',
			text: 'Postingan yang dihapus tidak bisa dikembalikan!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Ya, hapus!'
		});

		if (result.isConfirmed) {
			// Gunakan referensi yang sudah disimpan
			form.submit();
		}
	}
</script>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-3xl font-bold">My Posts</h1>
	<a
		href="/dashboard/posts/new"
		class="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
	>
		+ Tulis Baru
	</a>
</div>

<div class="rounded-lg bg-white p-4 shadow-md">
	<div class="space-y-4">
		{#if data.posts && data.posts.length > 0}
			{#each data.posts as post}
				<div class="flex items-center justify-between border-b pb-2">
					<div>
						<a href="/blog/{post.slug}" class="text-xl font-semibold hover:text-blue-600">
							{post.title}
						</a>
						<p class="text-sm text-gray-500">
							Published on: {new Date(post.created_at).toLocaleDateString()}
						</p>
					</div>
					<div class="space-x-2">
						<a href="/dashboard/posts/edit/{post.id}" class="text-blue-500 hover:underline">Edit</a>

						<form action="?/deletePost" method="POST" class="inline" on:submit={confirmDelete}>
							<input type="hidden" name="id" value={post.id} />
							<button type="submit" class="text-red-500 hover:underline">Delete</button>
						</form>
					</div>
				</div>
			{/each}
		{:else}
			<p class="py-8 text-center text-gray-500">Anda belum memiliki postingan.</p>
		{/if}
	</div>
</div>
