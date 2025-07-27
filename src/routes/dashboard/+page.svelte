<script lang="ts">
    import Swal from 'sweetalert2';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    // Tidak perlu import `page` store lagi jika tidak diakses di reactive statement
    // import { page } from '$app/stores';

    export let data: PageData;

    // Fungsi untuk konfirmasi penghapusan (tetap ada)
    async function confirmDelete(event: Event & { currentTarget: HTMLFormElement }) {
        event.preventDefault();
        const form = event.currentTarget;
        const result = await Swal.fire({
            title: 'Konfirmasi Hapus Postingan',
            text: 'Anda yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Hapus Saja!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            form.submit();
        }
    }

    // --- Perbaikan untuk Search ---
    // Inisialisasi searchTerm dari URL yang dikirim oleh server
    let searchTerm: string = data.searchQuery || '';
    let dateRange: string = '31 Maret 2025 - 31 Maret 2025'; // Dummy date range
    let selectedRowsCount: number = 0; // Untuk jumlah baris terpilih (dummy)

    let debounceTimeout: NodeJS.Timeout;

    // Fungsi yang akan dipanggil saat input berubah
    function handleSearchInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        searchTerm = inputElement.value; // Update nilai searchTerm

        clearTimeout(debounceTimeout); // Hapus timeout sebelumnya

        // Set timeout baru untuk memicu pencarian
        debounceTimeout = setTimeout(() => {
            // Pastikan ini hanya berjalan di browser (kondisi `typeof window !== 'undefined'`)
            // Atau lebih baik, seperti di bawah, tidak perlu langsung akses $page di sini
            // Cukup gunakan `goto` dengan parameter baru
            const currentUrl = new URL(window.location.href);
            const params = currentUrl.searchParams;

            if (searchTerm) {
                params.set('q', searchTerm);
            } else {
                params.delete('q');
            }

            // Gunakan goto untuk memperbarui URL tanpa reload penuh halaman
            // Ini akan memicu ulang load function di page.server.ts
            goto(`?${params.toString()}`, { replaceState: true, noScroll: true });

        }, 300); // Debounce 300ms
    }
    // --- Akhir Perbaikan untuk Search ---

    $: { // Reaktif untuk jumlah baris terpilih (dummy)
        selectedRowsCount = 0;
    }
</script>

<div class="container py-4">
    <div class="mb-4">
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#">Tabel Evaluasi AI</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-muted" href="#">Analitik</a>
            </li>
        </ul>
    </div>

    <main class="card shadow-sm p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h1 class="h3 fw-bold text-dark mb-2 mb-md-0">Daftar Hasil Evaluasi</h1>
            <div class="input-group" style="max-width: 250px;">
                <input type="text" class="form-control" readonly value={dateRange} aria-label="Date Range">
                <span class="input-group-text">
                    <i class="bi bi-calendar"></i>
                </span>
            </div>
        </div>

        <div class="input-group mb-4">
            <span class="input-group-text">
                <i class="bi bi-search"></i>
            </span>
            <input type="text" class="form-control" placeholder="Cari..." bind:value={searchTerm} on:input={handleSearchInput}/>
        </div>

        <div class="overflow-x-auto">
            {#if data.evaluations && data.evaluations.length > 0}
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="p-3">
                            <input class="form-check-input" type="checkbox" value="" aria-label="Select all rows">
                        </th>
                        <th scope="col" class="text-start">Penelpon</th>
                        <th scope="col" class="text-start">Kontak</th>
                        <th scope="col" class="text-start">Transkrip</th>
                        <th scope="col" class="text-start">Tanggal</th>
                        <th scope="col" class="text-start">Skor AI</th>
                        <th scope="col" class="text-start">Rating Manusia Rata-rata</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.evaluations as evaluation, i}
                        <tr>
                            <td class="p-3">
                                <input class="form-check-input" type="checkbox" value="" aria-label="Select row">
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-medium me-3" style="width: 40px; height: 40px; background-color: #6610f2 !important;">
                                        {evaluation.caller_initials || 'U'}
                                    </div>
                                    <div>
                                        <div class="fw-bold">{evaluation.caller_name || 'Tidak Dikenal'}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-telephone-fill text-success me-2"></i>
                                    <div class="text-muted small">{evaluation.phone_number || 'N/A'}</div>
                                </div>
                            </td>
                            <td>
                                <a class="d-flex align-items-center text-decoration-none text-primary" href={evaluation.transcript_link} target="_blank" rel="noopener noreferrer">
                                    <i class="bi bi-file-earmark-text me-1"></i>
                                    Lihat Riwayat
                                </a>
                            </td>
                            <td>{new Date(evaluation.evaluation_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td>{evaluation.ai_score}%</td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-star-fill text-warning me-1"></i>
                                    <span class="fw-bold">{evaluation.human_rating}</span>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            {:else}
                <div class="alert alert-info text-center m-4" role="alert">
                    <h4 class="alert-heading">Belum Ada Data Evaluasi!</h4>
                    <p class="mb-0">Tidak ada data evaluasi AI yang ditemukan.</p>
                </div>
            {/if}
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 flex-wrap">
            <div class="text-muted small mb-2 mb-md-0">
                {selectedRowsCount} dari {data.evaluations ? data.evaluations.length : 0} baris terpilih.
            </div>
            <div class="d-flex align-items-center">
                <span class="text-muted small me-2">Tampilkan baris</span>
                <div class="input-group" style="width: auto;">
                    <select class="form-select">
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                </div>
            </div>
        </div>
    </main>
</div>