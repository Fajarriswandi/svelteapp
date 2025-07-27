// src/routes/dashboard/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => { // Hapus getSession dari destructuring locals
    // --- Pola baru: Dapatkan user dan session langsung dari supabase.auth ---
    const { data: { user } } = await supabase.auth.getUser(); // Dapatkan user yang terverifikasi
    const { data: { session } } = await supabase.auth.getSession(); // Dapatkan session lengkap

    // Redirect jika tidak ada user TERVERIFIKASI, meskipun ada session
    if (!user) { // Hanya user yang terverifikasi yang boleh akses dashboard
        throw redirect(303, '/login');
    }
    // Jika user ada tapi session null (kasus sangat jarang tapi mungkin, atau jika mau lebih ketat)
    // if (!session) {
    //     throw redirect(303, '/login');
    // }


    // Ambil query pencarian dan paginasi dari URL
    const searchQuery = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Parameter Tanggal dari URL
    const startDateParam = url.searchParams.get('start_date');
    const endDateParam = url.searchParams.get('end_date');

    // DEBUGGING TANGGAL
    // console.log("DEBUG Server: Received start_date:", startDateParam);
    // console.log("DEBUG Server: Received end_date:", endDateParam);

    // Hitung offset
    const offset = (page - 1) * limit;

    // --- Ambil data Postingan Blog ---
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            slug,
            created_at,
            cover_image_url,
            content,
            profiles (
                username
            )
        `)
        .eq('user_id', user.id) // Filter berdasarkan user.id yang sudah diverifikasi
        .order('created_at', { ascending: false });

    if (postsError) {
        console.error('Error fetching posts:', postsError.message);
    }

    // --- Ambil data Evaluasi AI dari tabel 'evaluations' ---
    let evaluationsQuery = supabase
        .from('evaluations')
        .select('*', { count: 'exact' })
        .order('evaluation_date', { ascending: false });

    // Terapkan filter pencarian jika ada searchQuery
    if (searchQuery) {
        evaluationsQuery = evaluationsQuery.ilike('caller_name', `%${searchQuery}%`);
    }

    // Terapkan filter tanggal jika ada parameter tanggal
    if (startDateParam) {
        evaluationsQuery = evaluationsQuery.gte('evaluation_date', startDateParam);
    }
    if (endDateParam) {
        evaluationsQuery = evaluationsQuery.lte('evaluation_date', endDateParam);
    }

    // Terapkan limit dan offset untuk paginasi
    if (limit !== 0) {
        evaluationsQuery = evaluationsQuery.range(offset, offset + limit - 1);
    }

    const { data: evaluations, error: evaluationsError, count: totalCount } = await evaluationsQuery;

    if (evaluationsError) {
        console.error('Error fetching evaluations:', evaluationsError.message);
    }

    // DEBUGGING TANGGAL
    // console.log("DEBUG Server: Filtered Evaluations data:", evaluations);
    // console.log(`Pencarian: "${searchQuery || ''}", Halaman: ${page}, Limit: ${limit}, Offset: ${offset}, Total: ${totalCount}`);

    return {
        session, // Tetap kembalikan session ke klien
        posts: posts ?? [],
        evaluations: evaluations ?? [],
        searchQuery: searchQuery ?? '',
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalCount ?? 0,
        startDate: startDateParam ?? null, // Kirim kembali start_date ke klien
        endDate: endDateParam ?? null     // Kirim kembali end_date ke klien
    };
};

// Actions untuk menghapus postingan
export const actions: Actions = {
    deletePost: async ({ request, locals: { supabase } }) => { // Hapus getSession dari destructuring locals
        // --- Pola baru: Dapatkan user dan session langsung dari supabase.auth ---
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();

        if (!user) { // Hanya user yang terverifikasi yang boleh melakukan aksi ini
            throw redirect(303, '/login');
        }
        // Jika Anda memerlukan session lengkap untuk aksi ini, pastikan session juga ada
        // if (!session) {
        //     throw redirect(303, '/login');
        // }

        const formData = await request.formData();
        const postId = formData.get('id');

        if (!postId) {
            return { status: 400, body: { error: 'ID Postingan tidak ditemukan.' } };
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', user.id); // Filter berdasarkan user.id yang sudah diverifikasi

        if (error) {
            console.error('Error deleting post:', error.message);
            return { success: false, error: 'Gagal menghapus postingan.' };
        }

        return { success: true };
    }
};