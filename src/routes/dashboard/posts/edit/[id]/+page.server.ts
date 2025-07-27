import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_KEY } from '$env/static/private';

// 1. Load data post yang akan diedit
export const load: PageServerLoad = async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const { data: post } = await supabase
		.from('posts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!post) {
		throw error(404, 'Post not found');
	}

	if (post.user_id !== session.user.id) {
		throw error(403, 'Forbidden');
	}

	return { post };
};

// 2. Action untuk menyimpan perubahan
export const actions: Actions = {
	default: async ({ request, params, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const slug = formData.get('slug') as string;
		const imageFile = formData.get('cover_image_file') as File;

		// Ambil data post saat ini untuk mendapatkan URL gambar lama
		const { data: currentPost } = await supabase
			.from('posts')
			.select('cover_image_url')
			.eq('id', params.id)
			.single();

		let cover_image_url: string | null | undefined = currentPost?.cover_image_url;

		// Jika ada file gambar baru yang diunggah, proses filenya
		if (imageFile && imageFile.size > 0) {
			const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY);
			const fileName = `${Date.now()}_${imageFile.name}`;

			const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
				.from('post-images')
				.upload(fileName, imageFile);

			if (uploadError) {
				return fail(500, { error: 'Gagal mengunggah gambar baru.' });
			}

			const { data: publicUrlData } = supabaseAdmin.storage
				.from('post-images')
				.getPublicUrl(uploadData.path);

			cover_image_url = publicUrlData.publicUrl;
		}

		// Update data post di database
		const { error: updateError } = await supabase
			.from('posts')
			.update({
				title,
				content,
				slug,
				cover_image_url
			})
			.eq('id', params.id)
			.eq('user_id', session.user.id);

		if (updateError) {
			return fail(500, { error: 'Gagal memperbarui postingan.' });
		}

		return { success: true };
	}
};