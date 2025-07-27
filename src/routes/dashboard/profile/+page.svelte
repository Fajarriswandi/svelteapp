<script lang="ts">
	import { enhance } from '$app/forms';
	import Swal from 'sweetalert2';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Ambil data awal dari load function
	let username = data.profile?.username ?? '';
	let fullName = data.profile?.full_name ?? '';
	let website = data.profile?.website ?? '';
</script>

<h1 class="mb-6 text-3xl font-bold">Edit Profil Anda</h1>

<form
	method="POST"
	action="?/updateProfile"
	class="max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-md"
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				Swal.fire({
					title: 'Berhasil!',
					text: 'Profil Anda telah diperbarui.',
					icon: 'success',
					timer: 2000,
					showConfirmButton: false
				});
			} else if (result.type === 'failure') {
				Swal.fire({
					title: 'Gagal!',
					text: result.data?.error ?? 'Terjadi kesalahan.',
					icon: 'error'
				});
			}
		};
	}}
>
	<div>
		<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
		<input
			type="email"
			id="email"
			value={data.session?.user.email}
			class="mt-1 w-full bg-gray-100"
			disabled
		/>
	</div>
	<div>
		<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
		<input
			type="text"
			name="username"
			id="username"
			class="mt-1 w-full"
			bind:value={username}
			required
		/>
	</div>
	<div>
		<label for="fullName" class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
		<input type="text" name="fullName" id="fullName" class="mt-1 w-full" bind:value={fullName} />
	</div>
	<div>
		<label for="website" class="block text-sm font-medium text-gray-700">Website</label>
		<input type="url" name="website" id="website" class="mt-1 w-full" bind:value={website} />
	</div>

	<button type="submit" class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
		Simpan Perubahan
	</button>
</form>
