// src/routes/dashboard/(tabs)/analytics/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
    // Memverifikasi sesi pengguna
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw redirect(303, '/login');
    }

    // --- Logika Penentuan Rentang Tanggal ---
    // Dapatkan tanggal hari ini
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0, tambahkan 1

    // Menghitung hari terakhir di bulan ini
    // Parameter ketiga (0) untuk Date constructor akan memberikan hari terakhir bulan sebelumnya
    const lastDayOfMonth = new Date(year, today.getMonth() + 1, 0).getDate();
    
    // Set rentang default untuk bulan berjalan saat ini
    const defaultStartDate = `${year}-${month}-01`;
    const defaultEndDate = `${year}-${month}-${String(lastDayOfMonth).padStart(2, '0')}`;

    // Ambil parameter tanggal dari URL. Jika tidak ada, gunakan rentang default bulan berjalan.
    const startDateParam = url.searchParams.get('start_date') || defaultStartDate;
    const endDateParam = url.searchParams.get('end_date') || defaultEndDate;
    // --- Akhir Logika Penentuan Rentang Tanggal ---

    // --- Panggilan Fungsi RPC Paralel untuk Performa Optimal ---
    // Daripada menunggu setiap panggilan RPC satu per satu (serial), kita menjalankannya
    // secara bersamaan (paralel) dengan Promise.all(). Ini secara drastis mengurangi
    // waktu muat halaman, dari total waktu semua panggilan menjadi waktu panggilan terlama.
    const rpcPromises = [
        supabase.rpc('get_total_calls_by_date_range', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_avg_time_to_response', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_avg_mean_time_to_resolution', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_call_success_rate', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_fallback_rate', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_csat_score', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_sentiment_score', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_top_5_topics', { start_date_param: startDateParam, end_date_param: endDateParam }),
        supabase.rpc('get_daily_calls_chart_data', { start_date_param: startDateParam, end_date_param: endDateParam })
    ];

    // Menunggu semua promise selesai
    const results = await Promise.all(rpcPromises);

    // Destrukturisasi hasil dengan penanganan error yang aman
    const [
        totalCallsResult,
        avgResponseTimeResult,
        avgResolutionTimeResult,
        callSuccessRateResult,
        fallbackRateResult,
        csatScoreResult,
        sentimentScoreResult,
        topTopicsResult,
        dailyCallsChartDataResult
    ] = results;

    // Fungsi helper untuk mengekstrak data atau mengembalikan nilai default jika ada error
    const extractData = (result: { data: any, error: any }, key: string, defaultValue: any) => {
        if (result.error) {
            console.error(`Error calling RPC for ${key}:`, result.error.message);
            return defaultValue;
        }
        if (Array.isArray(result.data) && result.data.length > 0) {
            return result.data[0][key] ?? defaultValue;
        }
        return result.data ?? defaultValue;
    }

    const totalCalls = extractData(totalCallsResult, 'total_calls', 0);
    const avgResponseTime = extractData(avgResponseTimeResult, 'avg_time_seconds', 0);
    const avgResolutionTime = extractData(avgResolutionTimeResult, 'avg_time_minutes', 0);
    const callSuccessRate = extractData(callSuccessRateResult, 'success_rate', 0);
    const fallbackRate = extractData(fallbackRateResult, 'fallback_rate', 0);
    const csatScore = extractData(csatScoreResult, 'csat_score', 0);
    const sentimentScore = extractData(sentimentScoreResult, 'sentiment_score', 0);
    const topTopics = topTopicsResult.error ? [] : topTopicsResult.data || [];
    const dailyCallsChartData = dailyCallsChartDataResult.error ? [] : dailyCallsChartDataResult.data || [];

    // --- Debugging: Log semua data yang diambil ---
    console.log('DEBUG Server: Analytics Data Summary:', {
        totalCalls,
        avgResponseTime,
        avgResolutionTime,
        callSuccessRate,
        fallbackRate,
        csatScore,
        sentimentScore,
        topTopics,
        dailyCallsChartData,
        startDateParam, // Sertakan ini di log untuk verifikasi
        endDateParam    // Sertakan ini di log untuk verifikasi
    });
    // --- Akhir Debugging ---


    // Mengembalikan semua data yang akan tersedia sebagai props 'data' di +page.svelte
    return {
        totalCalls,
        avgResponseTime,
        avgResolutionTime,
        callSuccessRate,
        fallbackRate,
        csatScore,
        sentimentScore,
        topTopics,
        dailyCallsChartData,
        title: "Dashboard - Analitik",
        startDateParam, // Penting untuk Flatpickr defaultDate
        endDateParam    // Penting untuk Flatpickr defaultDate
    };
};