<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { LayoutData } from './$types'; // Gunakan LayoutData, bukan PageData untuk layout
    import Header from '$lib/components/Header.svelte';
    import { supabase } from '$lib/supabaseClient';
    import '../app.css'; // Pastikan file ini kosong dari Tailwind CSS
    import 'bootstrap/dist/css/bootstrap.min.css';

    export let data: LayoutData; // Props 'data' yang berisi session dan profile

    let { session, profile } = data; // Destructuring session dan profile dari data

    // Ini akan mereaktifkan 'session' setiap kali data.session berubah (misalnya setelah login/logout)
    $: session = data.session;
    // Ini akan mereaktifkan 'profile' setiap kali data.profile berubah
    $: profile = data.profile;

    // --- SANGAT PENTING: TAMBAHKAN KEMBALI CONSOLE.LOG INI ---
    // Output ini akan muncul di konsol browser Anda.
    // console.log("Data profil di +layout.svelte:", profile);
    // --- SANGAT PENTING: TAMBAHKAN KEMBALI CONSOLE.LOG INI ---

    onMount(() => {
        // Import Bootstrap JS secara dinamis hanya di klien
        import('bootstrap/dist/js/bootstrap.bundle.min.js');

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((event, _session) => {
            // Invalidate semua data jika sesi berubah untuk memicu refresh data load function
            // Ini akan memastikan 'data.session' dan 'data.profile' diupdate
            if (_session?.expires_at !== session?.expires_at) {
                invalidateAll();
            }
            // Update variabel lokal 'session' agar UI reaktif
            session = _session;
        });

        return () => subscription.unsubscribe();
    });
</script>

<svelte:head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
</svelte:head>

<div class="d-flex flex-column min-vh-100 bg-light text-dark">
    <Header {session} {profile} /> 

    <main class="container py-4 flex-grow-1"> 
        <slot />
    </main>

    </div>