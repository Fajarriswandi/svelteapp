import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  
  // console.log('--- MEMUAT LAYOUT DASHBOARD ---');

  const session = await getSession();

  
  // console.log('SESI DITEMUKAN DI DASHBOARD:', session ? `User ID: ${session.user.id}` : 'TIDAK ADA SESI');

  if (!session) {
    throw redirect(303, '/');
  }

  return { session };
};