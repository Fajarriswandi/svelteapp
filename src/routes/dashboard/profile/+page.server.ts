import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/');
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select(`username, full_name, website`)
		.eq('id', session.user.id)
		.single();

	return { session, profile };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const username = formData.get('username') as string;
		const website = formData.get('website') as string;

		const { error } = await supabase.from('profiles').upsert({
			id: session.user.id,
			full_name: fullName,
			username,
			website,
			updated_at: new Date()
		});

		if (error) {
			console.error('Error updating profile:', error);
			return fail(500, { error: 'Gagal memperbarui profil. Username mungkin sudah digunakan.' });
		}

		return { success: true };
	}
};
