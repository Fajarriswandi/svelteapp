<script lang="ts">
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import Swal from 'sweetalert2'; // Pastikan SweetAlert2 sudah diinstal (npm install sweetalert2)
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
    class="p-4 rounded shadow-sm bg-white"
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

    <div class="mb-3">
        <label for="title" class="form-label">Judul</label>
        <input
            type="text"
            name="title"
            id="title"
            class="form-control"
            bind:value={title}
            required
        />
    </div>
    <div class="mb-3">
        <label for="slug" class="form-label">Slug (untuk URL)</label>
        <input
            type="text"
            name="slug"
            id="slug"
            class="form-control"
            bind:value={slug}
            required
        />
    </div>
    <div class="mb-3">
        <label for="content" class="form-label">Konten</label>
        <textarea
            name="content"
            id="content"
            rows="10"
            class="form-control"
            required
            bind:value={content}
        ></textarea>
    </div>

    <div class="d-flex gap-2">
        {#if post}
            <button type="submit" class="btn btn-primary">
                Simpan Perubahan
            </button>
            <a href="/dashboard" class="btn btn-secondary">
                Batal
            </a>
        {:else}
            <button type="submit" class="btn btn-success">
                Publikasikan
            </button>
        {/if}
    </div>
</form>