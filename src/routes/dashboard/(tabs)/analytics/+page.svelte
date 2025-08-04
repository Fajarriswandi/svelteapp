<script lang="ts">
    // Import komponen kartu analitik
    import AnalyticsCardWithChart from '$lib/components/AnalyticsCardWithChart.svelte';
    import type { PageData } from './$types'; // Import PageData untuk menerima prop dari server
    import { goto } from '$app/navigation'; // Import goto untuk navigasi URL
    import { onMount, onDestroy } from 'svelte'; // Import onMount dan onDestroy
    import flatpickr from 'flatpickr'; // Import flatpickr
    import 'flatpickr/dist/flatpickr.min.css'; // Import CSS flatpickr
    import 'flatpickr/dist/themes/material_blue.css'; // Opsional: Tema flatpickr (bisa diganti)

    export let data: PageData; // Menerima semua data analitik dari +page.server.ts

    let dateRangeInput: HTMLInputElement; // Referensi ke elemen input Flatpickr
    let fp: flatpickr.Instance; // Instance Flatpickr

    // Fungsi untuk mereset rentang tanggal
    const resetDateRange = async () => {
        // Navigasi tanpa parameter tanggal, akan membuat +page.server.ts menggunakan nilai defaultnya
        await goto('/dashboard/analytics', { replaceState: true });
        // Flatpickr akan diupdate secara reaktif oleh blok $: di bawah
    };

    onMount(() => {
        // Inisialisasi Flatpickr
        fp = flatpickr(dateRangeInput, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            // Set defaultDate dari data yang diterima dari server, yang sudah mencakup parameter URL atau default
            defaultDate: [data.startDateParam, data.endDateParam],
            onChange: (selectedDates, dateStr, instance) => {
                if (selectedDates.length === 2) {
                    const startDate = instance.formatDate(selectedDates[0], 'Y-m-d');
                    const endDate = instance.formatDate(selectedDates[1], 'Y-m-d');
                    // Perbarui URL dengan rentang tanggal baru, ini akan memicu ulang load function di +page.server.ts
                    goto(`/dashboard/analytics?start_date=${startDate}&end_date=${endDate}`);
                }
            }
        });
    });

    // Blok reaktif untuk menyinkronkan Flatpickr dengan data dari URL.
    // Ini akan berjalan setiap kali `data` (termasuk startDateParam & endDateParam) berubah.
    $: if (fp && data.startDateParam && data.endDateParam) {
        const currentPickerDates = fp.selectedDates.map((d) => fp.formatDate(d, 'Y-m-d'));
        // Hanya update jika tanggal di picker berbeda dengan tanggal dari prop `data`
        // untuk menghindari loop tak terbatas. Argumen `false` di setDate mencegah trigger `onChange`.
        if (currentPickerDates[0] !== data.startDateParam || currentPickerDates[1] !== data.endDateParam) {
            fp.setDate([data.startDateParam, data.endDateParam], false);
        }
    }

    onDestroy(() => {
        // Hancurkan instance Flatpickr saat komponen dilepas untuk mencegah memory leak
        if (fp) {
            fp.destroy();
        }
    });
</script>

<svelte:head>
    <title>{data.title || 'Dashboard - Analitik'}</title>
</svelte:head>

<div class="d-flex justify-content-between mb-4 align-middle">
    <div>
        <h4 class="text-dark">AI Evaluation Table</h4>
        <span class="text-muted">Grafik dan statistik kinerja aplikasi akan ditampilkan di sini.</span>
    </div>
    <div>
        <div class="d-flex align-items-center">
            <div class="input-group inputGroup_iconRight me-2" style="max-width: 250px;">
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
                class="btn btn-outline-secondary btnCircle d-flex justify-content-center align-middle"
                on:click={resetDateRange}
                aria-label="Reset Filter Tanggal"
            >
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>
    </div>
</div>

<div class="container-fluid p-0">
    <!-- Section 1 -->
    <div class="row gx-3 row-gap-3 mb-3">
        <div class="col-md-4 col-sm-6">
            <!-- Number of Calls -->
            <AnalyticsCardWithChart
                title="Number of Calls"
                bigNumber={data.totalCalls.toLocaleString()}
                progressValue="+2,7%"
                progressText="From last week"
                isPositive={true}
                chartId="callsChart"
                chartData={data.dailyCallsChartData}
            />
            <!-- End Number of Calls -->
        </div>
        <div class="col-md-4 col-sm-6">
            <div class="card h-100">
                <div class="card-header">
                    <small>Avg. Time to response</small>
                    <span class="bigNumber">{data.avgResponseTime.toFixed(1)} Second</span>
                    <div class="numberProgress">
                        <span class="text-danger me-2">-1,7%</span> From last week
                    </div>
                </div>
                <div class="card-body">
                    <!-- Placeholder untuk chart atau konten lain jika ada -->
                </div>
            </div>
        </div>
        <div class="col-md-4 col-sm-6">
            <div class="card h-100">
                <div class="card-header">
                    <small>Avg. Mean Time to Resolution</small>
                    <span class="bigNumber"
                        >{Math.floor(data.avgResolutionTime)} Minute
                        {((data.avgResolutionTime % 1) * 60).toFixed(0)} Second</span
                    >
                    <div class="numberProgress">
                        <span class="text-success me-2">+2,7%</span>From last week
                    </div>
                </div>
                <div class="card-body">
                    <!-- Placeholder untuk chart atau konten lain jika ada -->
                </div>
            </div>
        </div>
    </div>

    <!-- Section 2 -->
    <div class="row gx-3 row-gap-3 mb-3">
        <div class="col-md-6 col-sm-12">
            <div class="card h-100">
                <div class="card-header">
                    <small>Call Success Rate</small>
                    <span class="bigNumber">{data.callSuccessRate.toFixed(0)}%</span>
                    <div class="numberProgress">
                        <span class="text-success me-2">+10%</span>From last week
                    </div>
                </div>
                <div class="card-body">
                    <!-- Placeholder untuk chart atau konten lain jika ada -->
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-12">
            <div class="card h-100">
                <div class="card-header">
                    <small>Fallback Rate</small>
                    <span class="bigNumber">{data.fallbackRate.toFixed(0)}%</span>
                    <div class="numberProgress">
                        <span class="text-danger me-2">-1,7%</span>From last week
                    </div>
                </div>
                <div class="card-body">
                    <!-- Placeholder untuk chart atau konten lain jika ada -->
                </div>
            </div>
        </div>
    </div>

    <!-- Section 3 -->
    <div class="row gx-3 row-gap-3 mb-3">
        <div class="col-md-3 col-sm-6">
            <div class="card h-100">
                <div class="card-header">
                    <small>CSAT SCORE</small>
                </div>
                <div class="card-body">
                    <h5 class="bigNumber mb-0 text-center">{data.csatScore.toFixed(1)}</h5>
                    <div class="d-flex justify-content-center align-items-center">
                        {#each Array(5) as _, i}
                            {@const starValue = i + 1}
                            {#if data.csatScore >= starValue}
                                <i class="bi bi-star-fill text-warning fs-5"></i>
                            {:else if data.csatScore >= starValue - 0.5}
                                <i class="bi bi-star-half text-warning fs-5"></i>
                            {:else}
                                <i class="bi bi-star text-warning fs-5"></i>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="card h-100">
                <div class="card-header">
                    <small>Sentiment Score</small>
                </div>
                <div class="card-body text-center">
                    <span class="bigNumber">{data.sentimentScore.toFixed(2)}</span>
                    <p class="text-muted small mb-0 mt-2">
                        {data.sentimentScore >= 0.7
                            ? 'Positive'
                            : data.sentimentScore >= 0.4
                              ? 'Neutral'
                              : 'Negative'}
                    </p>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-sm-12">
            <div class="card h-100">
                <div class="card-header">
                    <small>Top 5 topics</small>
                </div>
                <div class="card-body">
                    {#if data.topTopics && data.topTopics.length > 0}
                        <ul class="list-group list-group-flush">
                            {#each data.topTopics as topicData}
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    {topicData.topic}
                                    <span class="badge bg-primary rounded-pill">{topicData.count}</span>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-muted small text-center">Tidak ada topik tersedia.</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>