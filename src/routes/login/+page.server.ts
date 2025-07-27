import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
// Kita TIDAK PERLU import supabase dari $lib/supabaseClient di sini lagi

export const actions: Actions = {
	// Perhatikan 'locals: { supabase }' ditambahkan di sini
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		// TAMBAHKAN BARIS INI UNTUK DEBUG
		console.log('--- HASIL LOGIN ACTION ---', { data: data.session, error });

		if (error) {
			return fail(error.status ?? 500, { error: error.message });
		}

		throw redirect(303, '/dashboard');
	}
};
