<script lang="ts">
    import { enhance } from '$app/forms';
    import type { Session } from '@supabase/supabase-js';

    // Definisikan tipe untuk properti yang diterima
    export let session: Session | null;
    export let profile: {
        username?: string;
        full_name?: string;
        avatar_url?: string;
    } | null;

    // Fungsi helper untuk mendapatkan inisial
    function getInitials(fullName: string | undefined | null): string {
        if (!fullName) return 'U'; // 'U' for Unknown
        const parts = fullName.split(' ').filter(Boolean); // Filter out empty strings
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Variabel reaktif untuk inisial
    $: initials = getInitials(profile?.full_name || profile?.username);
</script>

<nav class="navbar navbar-expand-lg navbarContainer fixed-top bg-body-tertiary">
    <div class="container">
        <a class="navbar-brand" href="/">
            <img src="/logodubai.png" alt="Digital Dubai Logo" style="height: 40px; width: auto;" class="d-inline-block align-text-top">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                {#if session}
                    <li class="nav-item">
                        <a class="nav-link" href="/dashboard">Dashboard</a>
                    </li>
                    {/if}
            </ul>
            <ul class="navbar-nav">
                {#if session}
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="javascript:void(0)" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {#if profile?.avatar_url}
                                <img src={profile.avatar_url} alt="Avatar" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                            {:else}
                                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2" style="width: 40px; height: 40px;">
                                    {initials}
                                </div>
                            {/if}
                            <span class="d-none d-lg-block">{profile?.username || profile?.full_name || 'Pengguna'}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                            <li><a class="dropdown-item" href="/dashboard/profile">Edit Profile</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form method="POST" action="/logout" use:enhance>
                                    <button type="submit" class="dropdown-item">Logout</button>
                                </form>
                            </li>
                        </ul>
                    </li>
                {:else}
                    <li class="nav-item">
                        <a class="nav-link" href="/login">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-primary ms-2" href="/register">Register</a>
                    </li>
                {/if}
            </ul>
        </div>
    </div>
</nav>