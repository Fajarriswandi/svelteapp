<script lang="ts">
    import type { ActionData } from './$types';
    export let form: ActionData;
</script>

<div class="d-flex justify-content-center align-items-center min-vh-100 py-5">
    <div class="card shadow-lg p-4" style="max-width: 400px; width: 100%;">
        <div class="card-body">
            <h1 class="card-title text-center mb-4 fs-3 fw-bold">Silahkan Masuk</h1>
            <form method="POST" action="?/login">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        class="form-control"
                        required
                        placeholder="nama@contoh.com"
                    />
                </div>
                <div class="mb-4"> 
                    <label for="password" class="form-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        class="form-control"
                        required
                        placeholder="Kata Sandi Anda"
                    />
                </div>
                {#if form?.error}
                    <div class="alert alert-danger mb-3" role="alert">
                        {form.error}
                    </div>
                {/if}
                <div class="d-grid mb-3"> 
                    <button
                        type="submit"
                        class="btn btn-primary btn-lg"
                    >
                        Login
                    </button>
                </div>
            </form>
            <p class="text-center text-muted mt-3">
                Belum punya akun? <a
                    href="/register"
                    class="text-primary fw-bold text-decoration-none"
                    >Daftar di sini</a
                >
            </p>
        </div>
    </div>
</div>