<script lang="ts">
    import SmallLineChart from './SmallLineChart.svelte'; // Import komponen grafik garis kecil

    // Props untuk data kartu dan grafik
    export let title: string; // Judul kartu (misal: "Number of Calls")
    export let bigNumber: string; // Angka besar di header kartu (misal: "2,500")
    export let progressValue: string; // Nilai progres (misal: "+2,7%")
    export let progressText: string; // Teks progres (misal: "From last week")
    export let isPositive: boolean; // Boolean untuk menentukan warna teks progres (true = hijau, false = merah)
    export let chartId: string; // ID unik untuk div chart
    export let chartData: { date: string; value: number }[]; // Data untuk grafik
</script>

<!-- Struktur Kartu Analitik -->
<div class="card h-100">
    <div class="card-header">
        <small>{title}</small>
        <span class="bigNumber">{bigNumber}</span>
        <div class="numberProgress">
            <span class={isPositive ? 'text-success' : 'text-danger'} class:me-2={true}>
                {progressValue}
            </span>
            {progressText}
        </div>
    </div>
    <div class="card-body pb-4">
        <!-- Menggunakan komponen SmallLineChart -->
        <SmallLineChart {chartId} {chartData} />
    </div>
</div>

<style lang="scss">
    /* Gaya kustom untuk komponen ini */
    .card-header {
        padding: 1rem;
        border-bottom: 1px solid var(--bs-card-border-color); /* Mengambil warna border dari variabel Bootstrap */
    }
    .bigNumber {
        display: block;
        font-size: 2.2rem; /* Ukuran font lebih besar */
        font-weight: 600; /* Lebih tebal */
        line-height: 1.2;
        margin-top: 0.25rem;
        color: var(--bs-body-color); /* Warna teks utama Bootstrap */
    }
    .numberProgress {
        font-size: 0.875rem; /* Ukuran font kecil */
        color: var(--bs-secondary); /* Warna teks sekunder Bootstrap */
    }
    /* Warna teks progres akan diatur oleh kelas Bootstrap text-success/text-danger */
    .text-success {
        color: var(--bs-success) !important; /* Memastikan warna hijau dari Bootstrap */
    }
    .text-danger {
        color: var(--bs-danger) !important; /* Memastikan warna merah dari Bootstrap */
    }
</style>
