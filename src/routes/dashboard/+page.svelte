<script lang="ts">
    import Swal from 'sweetalert2';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    // Hapus `import { onMount, tick } from 'svelte';` (tidak lagi diperlukan)

    export let data: PageData;

    let searchTerm: string = data.searchQuery || '';

    // Deklarasi Reaktif untuk itemsPerPage
    let itemsPerPage: number;
    // Gunakan inisialisasi reaktif dari data
    // ini akan memastikan itemsPerPage selalu sinkron dengan data.itemsPerPage dari server
    $: itemsPerPage = Number(data.itemsPerPage || 10);

    let totalItems: number = data.totalItems;

    // Dummy data for date range
    let dateRange: string = '31 Maret 2025 - 31 Maret 2025';
    let selectedRowsCount: number = 0; // Untuk jumlah baris terpilih (dummy)

    let debounceTimeout: NodeJS.Timeout;

    // --- HAPUS REFERENSI ELEMEN SELECT (selectElement tidak lagi diperlukan) ---
    // Hapus `let selectElement: HTMLSelectElement;`
    // --------------------------------------------------------------------------

    // --- HAPUS BLOK ONMOUNT INI (penyebab utama masalah di sini) ---
    // onMount(async () => {
    //     await tick();
    //     if (selectElement) {
    //         selectElement.value = itemsPerPage.toString();
    //     }
    // });
    // ----------------------------------------------------------------

    // --- HAPUS BLOK REAKTIF YANG MENYEBABKAN INFINITE LOOP INI ---
    // $: {
    //     tick().then(() => {
    //         if (selectElement) {
    //             selectElement.value = itemsPerPage.toString();
    //         }
    //     });
    // }
    // -----------------------------------------------------------

    // Reaktivitas untuk Pencarian
    function handleSearchInput() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const params = new URLSearchParams($page.url.searchParams);
            if (searchTerm) {
                params.set('q', searchTerm);
            } else {
                params.delete('q');
            }
            params.set('page', '1');
            goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
        }, 300);
    }

    // Reaktivitas untuk "Tampilkan baris per halaman"
    function handleItemsPerPageChange() {
        // itemsPerPage akan secara otomatis diupdate oleh bind:value
        const params = new URLSearchParams($page.url.searchParams);
        params.set('limit', itemsPerPage.toString()); // Update parameter 'limit'
        params.set('page', '1'); // Selalu reset ke halaman 1 saat limit berubah
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    // Konfirmasi Hapus Postingan (tetap ada)
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

    // Dummy counter for selected rows
    $: selectedRowsCount = 0;
</script>

<div class="container py-4">
    <div class="mb-4">
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="javascript:void(0)">Tabel Evaluasi AI</a>
            </li>
            <li class="nav-item">
                <a class="nav-link text-muted" href="javascript:void(0)">Analitik</a>
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
                    <h4 class="alert-heading">Data Tidak Ditemukan</h4>
                    <p class="mb-0">Tidak ada data evaluasi yang ditemukan.</p>
                </div>
            {/if}
        </div>

        <div class="d-flex justify-content-between align-items-center mt-4 flex-wrap">
            <div class="text-muted small mb-2 mb-md-0">
                {data.evaluations ? data.evaluations.length : 0} dari {data.totalItems} baris.
            </div>
            <div class="d-flex align-items-center">
                <span class="text-muted small me-2">Tampilkan baris</span>
                <div class="input-group" style="width: auto;">
                    <select class="form-select" bind:value={itemsPerPage} on:change={handleItemsPerPageChange}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={0}>Semua</option>
                    </select>
                </div>
            </div>
        </div>
    </main>
</div>