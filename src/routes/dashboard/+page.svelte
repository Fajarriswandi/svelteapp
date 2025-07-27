<script lang="ts">
	import Swal from 'sweetalert2';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import flatpickr from 'flatpickr';
	// Opsional: Untuk lokalisasi bahasa (misal Bahasa Indonesia)
	import { Indonesian } from 'flatpickr/dist/l10n/id.js';

	export let data: PageData;

	let searchTerm: string = data.searchQuery || '';

	let itemsPerPage: number;
	$: itemsPerPage = Number(data.itemsPerPage || 10);

	let totalItems: number = data.totalItems;

	// Variabel State untuk Rentang Tanggal
	let startDate: string | null = data.startDate || null;
	let endDate: string | null = data.endDate || null;
	let dateRangeInput: HTMLInputElement; // Referensi ke elemen input tanggal
	let flatpickrInstance: flatpickr.Instance; // Untuk menyimpan instance flatpickr

	let selectedRowsCount: number = 0; // Dummy
	let debounceTimeout: NodeJS.Timeout;

	// Inisialisasi Flatpickr di onMount
	onMount(() => {
		flatpickrInstance = flatpickr(dateRangeInput, {
			mode: 'range',
			dateFormat: 'Y-m-d',
			altInput: true,
			altFormat: 'd F Y',
			locale: Indonesian, // Aktifkan lokalisasi Bahasa Indonesia
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

	// --- Fungsi untuk Mengupdate URL dengan Rentang Tanggal ---
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

	// --- FUNGSI BARU: Reset Rentang Tanggal ---
	function resetDateRange() {
		startDate = null;
		endDate = null;
		if (flatpickrInstance) {
			flatpickrInstance.clear(); // Bersihkan input flatpickr
		}
		handleDateRangeChange(); // Panggil untuk update URL (hapus param tanggal)
	}
	// ----------------------------------------

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

	// Dummy counter for selected rows
	$: selectedRowsCount = 0;
</script>

<div class="container py-4">
	<div class="mb-4">
		<ul class="nav nav-tabs">
			<li class="nav-item">
				<button class="nav-link active" type="button" aria-current="page">Tabel Evaluasi AI</button>
			</li>
			<li class="nav-item">
				<button class="nav-link text-muted" type="button">Analitik</button>
			</li>
		</ul>
	</div>

	<main class="card p-4 shadow-sm">
		<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
			<h1 class="h3 fw-bold text-dark mb-md-0 mb-2">Daftar Hasil Evaluasi</h1>
			<div class="d-flex align-items-center">
				<div class="input-group me-2" style="max-width: 250px;">
					<input
						type="text"
						class="form-control"
						placeholder="Pilih Rentang Tanggal"
						aria-label="Date Range"
						bind:this={dateRangeInput}
					/>
					<span class="input-group-text">
						<i class="bi bi-calendar"></i>
					</span>
				</div>
				<button
					class="btn btn-outline-secondary"
					on:click={resetDateRange}
					aria-label="Reset Filter Tanggal"
				>
					<i class="bi bi-arrow-clockwise"></i>
				</button>
			</div>
		</div>

		<div class="input-group mb-4">
			<span class="input-group-text">
				<i class="bi bi-search"></i>
			</span>
			<input
				type="text"
				class="form-control"
				placeholder="Cari..."
				bind:value={searchTerm}
				on:input={handleSearchInput}
			/>
		</div>

		<div class="overflow-x-auto">
			{#if data.evaluations && data.evaluations.length > 0}
				<table class="table-hover mb-0 table align-middle">
					<thead class="table-light">
						<tr>
							<th scope="col" class="p-3">
								<input
									class="form-check-input"
									type="checkbox"
									value=""
									aria-label="Select all rows"
								/>
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
									<input
										class="form-check-input"
										type="checkbox"
										value=""
										aria-label="Select row"
									/>
								</td>
								<td>
									<div class="d-flex align-items-center">
										<div
											class="bg-primary rounded-circle d-flex align-items-center justify-content-center fw-medium me-3 text-white"
											style="width: 40px; height: 40px; background-color: #6610f2 !important;"
										>
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
									<a
										class="d-flex align-items-center text-decoration-none text-primary"
										href={evaluation.transcript_link}
										target="_blank"
										rel="noopener noreferrer"
									>
										<i class="bi bi-file-earmark-text me-1"></i>
										Lihat Riwayat
									</a>
								</td>
								<td
									>{new Date(evaluation.evaluation_date).toLocaleDateString('id-ID', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}</td
								>
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
				<div class="alert alert-info m-4 text-center" role="alert">
					<h4 class="alert-heading">Belum Ada Data Evaluasi!</h4>
					<p class="mb-0">Tidak ada data evaluasi AI yang ditemukan.</p>
				</div>
			{/if}
		</div>

		<div class="d-flex justify-content-between align-items-center mt-4 flex-wrap">
			<div class="text-muted small mb-md-0 mb-2">
				{data.evaluations ? data.evaluations.length : 0} dari {data.totalItems} baris.
			</div>
			<div class="d-flex align-items-center">
				<span class="text-muted small me-2">Tampilkan baris</span>
				<div class="input-group" style="width: auto;">
					<select
						class="form-select"
						bind:value={itemsPerPage}
						on:change={handleItemsPerPageChange}
					>
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
