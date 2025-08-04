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


    // --- Panggilan Fungsi RPC untuk Setiap Metrik ---

    // 1. Total Panggilan
    const { data: totalCallsResult, error: totalCallsError } = await supabase.rpc('get_total_calls_by_date_range', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let totalCalls = 0;
    if (totalCallsError) {
        console.error('Error calling RPC get_total_calls_by_date_range:', totalCallsError.message);
    } else if (totalCallsResult && totalCallsResult.length > 0) {
        totalCalls = totalCallsResult[0].total_calls;
    }

    // 2. Rata-rata Waktu Respons
    const { data: avgResponseTimeResult, error: avgResponseTimeError } = await supabase.rpc('get_avg_time_to_response', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let avgResponseTime = 0;
    if (avgResponseTimeError) {
        console.error('Error calling RPC get_avg_time_to_response:', avgResponseTimeError.message);
    } else if (avgResponseTimeResult && avgResponseTimeResult.length > 0) {
        avgResponseTime = avgResponseTimeResult[0].avg_time_seconds;
    }

    // 3. Rata-rata Waktu Resolusi
    const { data: avgResolutionTimeResult, error: avgResolutionTimeError } = await supabase.rpc('get_avg_mean_time_to_resolution', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let avgResolutionTime = 0;
    if (avgResolutionTimeError) {
        console.error('Error calling RPC get_avg_mean_time_to_resolution:', avgResolutionTimeError.message);
    } else if (avgResolutionTimeResult && avgResolutionTimeResult.length > 0) {
        avgResolutionTime = avgResolutionTimeResult[0].avg_time_minutes;
    }

    // 4. Tingkat Keberhasilan Panggilan
    const { data: callSuccessRateResult, error: callSuccessRateError } = await supabase.rpc('get_call_success_rate', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let callSuccessRate = 0;
    if (callSuccessRateError) {
        console.error('Error calling RPC get_call_success_rate:', callSuccessRateError.message);
    } else if (callSuccessRateResult && callSuccessRateResult.length > 0) {
        callSuccessRate = callSuccessRateResult[0].success_rate;
    }

    // 5. Tingkat Fallback
    const { data: fallbackRateResult, error: fallbackRateError } = await supabase.rpc('get_fallback_rate', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let fallbackRate = 0;
    if (fallbackRateError) {
        console.error('Error calling RPC get_fallback_rate:', fallbackRateError.message);
    } else if (fallbackRateResult && fallbackRateResult.length > 0) {
        fallbackRate = fallbackRateResult[0].fallback_rate;
    }

    // 6. Skor CSAT
    const { data: csatScoreResult, error: csatScoreError } = await supabase.rpc('get_csat_score', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let csatScore = 0;
    if (csatScoreError) {
        console.error('Error calling RPC get_csat_score:', csatScoreError.message);
    } else if (csatScoreResult && csatScoreResult.length > 0) {
        csatScore = csatScoreResult[0].csat_score;
    }

    // 7. Skor Sentimen
    const { data: sentimentScoreResult, error: sentimentScoreError } = await supabase.rpc('get_sentiment_score', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let sentimentScore = 0;
    if (sentimentScoreError) {
        console.error('Error calling RPC get_sentiment_score:', sentimentScoreError.message);
    } else if (sentimentScoreResult && sentimentScoreResult.length > 0) {
        sentimentScore = sentimentScoreResult[0].sentiment_score;
    }

    // 8. Topik Teratas
    const { data: topTopicsResult, error: topTopicsError } = await supabase.rpc('get_top_5_topics', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let topTopics = [];
    if (topTopicsError) {
        console.error('Error calling RPC get_top_5_topics:', topTopicsError.message);
    } else if (topTopicsResult) {
        topTopics = topTopicsResult;
    }

    // 9. Data Grafik Panggilan Harian
    const { data: dailyCallsChartDataResult, error: dailyCallsChartDataError } = await supabase.rpc('get_daily_calls_chart_data', {
        start_date_param: startDateParam,
        end_date_param: endDateParam
    });
    let dailyCallsChartData = [];
    if (dailyCallsChartDataError) {
        console.error('Error calling RPC get_daily_calls_chart_data:', dailyCallsChartDataError.message);
    } else if (dailyCallsChartDataResult) {
        dailyCallsChartData = dailyCallsChartDataResult;
    }
    // --- Akhir Panggilan Fungsi RPC ---


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