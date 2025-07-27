<script lang="ts">
    import Swal from 'sweetalert2';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import flatpickr from 'flatpickr';
    import { Indonesian } from 'flatpickr/dist/l10n/id.js'; // Pastikan path benar!

    export let data: PageData;

    // --- Definisi Tipe untuk Evaluasi dan Detailnya (HARUS LENGKAP & AKURAT) ---
    interface EvaluationDetail {
        id: string;
        created_at: string;
        evaluation_id: string;
        category_key: string;
        category_name: string;
        category_question: string;
        rating: number;
        icon_name: string;
    }

    interface Evaluation {
        id: string;
        created_at: string;
        caller_name: string;
        caller_initials: string;
        phone_number: string;
        transcript_link: string;
        evaluation_date: string;
        ai_score: number;
        human_rating: number;
        evaluation_details?: EvaluationDetail[]; // Pastikan properti ini ada dan adalah array
    }
    // -------------------------------------------------------------------------

    let searchTerm: string = data.searchQuery || '';

    let itemsPerPage: number;
    $: itemsPerPage = Number(data.itemsPerPage || 10);

    let totalItems: number = data.totalItems;

    let startDate: string | null = data.startDate || null;
    let endDate: string | null = data.endDate || null;
    let dateRangeInput: HTMLInputElement;
    let flatpickrInstance: flatpickr.Instance;

    let selectedEvaluation: Evaluation | null = null; // Akan menyimpan data evaluasi yang dipilih

    let selectedRowsCount: number = 0; // Dummy
    let debounceTimeout: NodeJS.Timeout;

    // Inisialisasi Flatpickr di onMount
    onMount(() => {
        flatpickrInstance = flatpickr(dateRangeInput, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            altInput: true,
            altFormat: 'd F Y',
            locale: Indonesian,
            defaultDate: startDate && endDate ? [startDate, endDate] : undefined,

            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length === 2) {
                    startDate = instance.formatDate(selectedDates[0], 'Y-m-d');
                    endDate = instance.formatDate(selectedDates[1], 'Y-m-d');
                    handleDateRangeChange();
                } else if (selectedDates.length === 0) {
                    startDate = null;
                    endDate = null;
                    handleDateRangeChange();
                }
            }
        });
        return () => {
            if (flatpickrInstance) {
                flatpickrInstance.destroy();
            }
        };
    });

    // Fungsi untuk Mengupdate URL dengan Rentang Tanggal
    function handleDateRangeChange() {
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', '1');

        if (startDate && endDate) {
            params.set('start_date', startDate);
            params.set('end_date', endDate);
        } else {
            params.delete('start_date');
            params.delete('end_date');
        }
        goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
    }

    // Fungsi Reset Rentang Tanggal
    function resetDateRange() {
        startDate = null;
        endDate = null;
        if (flatpickrInstance) {
            flatpickrInstance.clear();
        }
        handleDateRangeChange();
    }

    // Tampilkan Detail Offcanvas
    function showOffcanvasDetail(evaluation: Evaluation) {
        selectedEvaluation = evaluation;
    }

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
        const params = new URLSearchParams($page.url.searchParams);
        params.set('limit', itemsPerPage.toString());
        params.set('page', '1');
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

    $: selectedRowsCount = 0;
</script>

<svelte:head>
    <title>{data.title || "Dashboard"}</title>
</svelte:head>

<div class="container py-4">

    <main class="card shadow-sm p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h1 class="h3 fw-bold text-dark mb-2 mb-md-0">Daftar Hasil Evaluasi</h1>
            <div class="d-flex align-items-center">
                <div class="input-group me-2" style="max-width: 250px;">
                    <input type="text" class="form-control" placeholder="Pilih Rentang Tanggal" aria-label="Date Range" bind:this={dateRangeInput}>
                    <span class="input-group-text">
                        <i class="bi bi-calendar"></i>
                    </span>
                </div>
                <button class="btn btn-outline-secondary" on:click={resetDateRange} aria-label="Reset Filter Tanggal">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
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
                    {#each data.evaluations as evaluation}
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
                                <button
                                    type="button"
                                    class="btn btn-link text-decoration-none text-primary p-0"
                                    data-bs-toggle="offcanvas"
                                    data-bs-target="#offcanvasDetail"
                                    aria-controls="offcanvasDetail"
                                    on:click={() => showOffcanvasDetail(evaluation)}
                                >
                                    <i class="bi bi-file-earmark-text me-1"></i>
                                    Lihat Riwayat
                                </button>
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

<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasDetail" aria-labelledby="offcanvasDetailLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasDetailLabel">
            Detail Evaluasi: {selectedEvaluation ? selectedEvaluation.caller_name : 'N/A'}
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        {#if selectedEvaluation}
            <div class="d-flex align-items-center mb-3">
                <div class="me-auto">
                    <h6 class="mb-1 text-muted">Name</h6>
                    <h5 class="fw-bold">{selectedEvaluation.caller_name}</h5>
                </div>
                <div>
                    <h6 class="mb-1 text-muted text-end">WhatsApp Number</h6>
                    <p class="mb-0 text-end">
                        <i class="bi bi-whatsapp text-success me-1"></i> {selectedEvaluation.phone_number}
                    </p>
                </div>
            </div>

            <div class="mb-4 p-3 bg-light rounded">
                <h6 class="fw-bold mb-2">Final Rating</h6>
                <div class="d-flex align-items-center mb-1">
                    <span class="fs-4 fw-bold me-2">{selectedEvaluation.human_rating}</span>
                    <div class="d-flex align-items-center">
                        {#each Array(5) as _, i}
                            {@const starValue = i + 1}
                            {#if selectedEvaluation.human_rating >= starValue}
                                <i class="bi bi-star-fill text-warning fs-5"></i>
                            {:else if selectedEvaluation.human_rating >= starValue - 0.5}
                                <i class="bi bi-star-half text-warning fs-5"></i>
                            {:else}
                                <i class="bi bi-star text-warning fs-5"></i>
                            {/if}
                        {/each}
                    </div>
                </div>
                <p class="text-muted small mb-0">This score representing the full exchange quality</p>
            </div>

            {#if selectedEvaluation.evaluation_details && selectedEvaluation.evaluation_details.length > 0}
                <div class="mb-4">
                    <h6 class="fw-bold mb-3">Kategori Evaluasi</h6>
                    {#each selectedEvaluation.evaluation_details as detail}
                        <div class="d-flex align-items-start mb-3 p-2 border rounded">
                            <div class="me-3 fs-4 text-primary">
                                <i class="bi bi-{detail.icon_name}"></i>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-1">{detail.category_name}</h6>
                                <p class="text-muted small mb-1">{detail.category_question}</p>
                                <div class="d-flex align-items-center">
                                    <span class="text-muted small me-2">Overall Rating:</span>
                                    <div class="d-flex align-items-center">
                                        {#each Array(5) as _, i}
                                            {@const starValue = i + 1}
                                            {#if detail.rating >= starValue}
                                                <i class="bi bi-star-fill text-warning fs-6"></i>
                                            {:else if detail.rating >= starValue - 0.5}
                                                <i class="bi bi-star-half text-warning fs-6"></i>
                                            {:else}
                                                <i class="bi bi-star text-warning fs-6"></i>
                                            {/if}
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            <hr>
            <h6>Informasi Tambahan:</h6>
            <p class="text-muted small">ID Evaluasi: {selectedEvaluation.id}</p>
            <p class="text-muted small">
                Dibuat Pada: {new Date(selectedEvaluation.created_at).toLocaleString('id-ID')}
            </p>
            <p class="text-muted small">
                Link Transkrip: 
                <a href={selectedEvaluation.transcript_link} target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none">
                    {selectedEvaluation.transcript_link} <i class="bi bi-box-arrow-up-right ms-1"></i>
                </a>
            </p>
        {:else}
            <p>Memuat detail evaluasi...</p>
        {/if}
    </div>
</div>