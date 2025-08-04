<script lang="ts">
    import { page } from '$app/stores'; // Import page store untuk cek URL aktif

    // Variabel untuk menyimpan path saat ini untuk mengaktifkan tab yang benar
    $: currentPath = $page.url.pathname;
</script>

<div class="container py-5 mt-4">
    <div class="mb-4">
        <ul class="nav nav-tabs navtabsCostume">
            <li class="nav-item">
                <a 
                    class="nav-link" 
                    class:active={currentPath === '/dashboard/ai-evaluation'} 
                    href="/dashboard/ai-evaluation">
                    AI Evaluation Table
                </a>
            </li>
            <li class="nav-item">
                <a 
                    class="nav-link" 
                    class:active={currentPath === '/dashboard/analytics'} 
                    href="/dashboard/analytics">
                    Analytics
                </a>
            </li>
        </ul>
    </div>

    <slot />
</div>