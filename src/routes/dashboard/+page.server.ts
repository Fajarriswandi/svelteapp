// src/routes/dashboard/+page.server.ts
// Ini adalah halaman default untuk /dashboard, yang hanya melakukan redirect
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'; // Hanya butuh PageServerLoad

export const load: PageServerLoad = async () => {
    // Redirect ke tab "Tabel Evaluasi AI" secara default
    throw redirect(303, '/dashboard/ai-evaluation');
};