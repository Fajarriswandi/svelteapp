// src/routes/logout/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ locals: { supabase } }) => { // Destructuring locals untuk langsung mendapatkan supabase
    await supabase.auth.signOut();
    throw redirect(303, '/');
  }
};