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

    // SweetAlert2 callback untuk enhance form
    const submitEnhance = () => {
        return async ({ result }) => {
            if (result.type === 'success') {
                await Swal.fire({
                    title: 'Berhasil!',
                    text: 'Profil Anda telah diperbarui.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else if (result.type === 'failure') {
                await Swal.fire({
                    title: 'Gagal!',
                    text: result.data?.error ?? 'Terjadi kesalahan saat memperbarui profil.',
                    icon: 'error'
                });
            }
        };
    };
</script>

<div class="row justify-content-center">
    <div class="col-lg-8 col-md-10">
        <h1 class="mb-4 display-6 fw-bold text-center">Edit Profil Anda</h1>

        <div class="card shadow-lg mb-5">
            <div class="card-body p-4">
                <form method="POST" action="?/updateProfile" use:enhance={submitEnhance}>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={data.session?.user.email}
                            class="form-control"
                            disabled
                        />
                        <div class="form-text">Email Anda tidak dapat diubah.</div>
                    </div>
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            class="form-control"
                            bind:value={username}
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="fullName" class="form-label">Nama Lengkap</label>
                        <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            class="form-control"
                            bind:value={fullName}
                        />
                    </div>
                    <div class="mb-4">
                        <label for="website" class="form-label">Website</label>
                        <input
                            type="url"
                            name="website"
                            id="website"
                            class="form-control"
                            bind:value={website}
                            placeholder="https://contoh.com"
                        />
                    </div>

                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="bi bi-save me-2"></i> Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>