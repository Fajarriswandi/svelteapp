import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const slug = formData.get('slug') as string;
		const imageFile = formData.get('cover_image_file') as File;

		let cover_image_url: string | null = null;

		if (imageFile && imageFile.size > 0) {
			const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);

			const fileName = `${Date.now()}_${imageFile.name}`;
			const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
				.from('post-images')
				.upload(fileName, imageFile);

			if (uploadError) {
				return fail(500, { error: 'Gagal mengunggah gambar.' });
			}

			const { data: publicUrlData } = supabaseAdmin.storage
				.from('post-images')
				.getPublicUrl(uploadData.path);
			
			cover_image_url = publicUrlData.publicUrl;
		}

		const { error: insertError } = await supabase.from('posts').insert({
			title,
			content,
			slug,
			user_id: session.user.id,
			cover_image_url
		});

		if (insertError) {
			return fail(500, {
				error: 'Gagal membuat postingan. Slug mungkin sudah ada.'
			});
		}

		return { success: true };
	}
};