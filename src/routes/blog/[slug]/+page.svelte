<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
    <title>{data.title || "Blog"}</title> 
</svelte:head>

<div class="container py-5">
	<nav aria-label="breadcrumb" class="mb-4">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="/" class="text-decoration-none">Beranda</a></li>
			<li class="breadcrumb-item active" aria-current="page">{data.post.title}</li>
		</ol>
	</nav>

	<div class="card mb-5 shadow-sm">
		{#if data.post.cover_image_url}
			<img
				src={data.post.cover_image_url}
				class="card-img-top"
				alt="{data.post.title} cover"
				style="max-height: 400px; object-fit: cover;"
			/>
		{/if}
		<div class="card-body">
			<h1 class="card-title display-5 fw-bold mb-3">{data.post.title}</h1>

			<p class="card-subtitle text-muted d-flex align-items-center mb-4 flex-wrap">
				<span class="me-3"
					><i class="bi bi-calendar-event me-1"></i> Diposting: {new Date(
						data.post.created_at
					).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span
				>
				{#if data.post.profiles?.username}
					<span class="me-3"
						><i class="bi bi-person me-1"></i> Oleh:
						<span class="fw-bold">{data.post.profiles.username}</span></span
					>
				{/if}
			</p>

			<div class="post-content mb-4 mt-4">
				{@html data.post.content}
			</div>

			<hr class="my-4" />

			<a href="/" class="btn btn-outline-primary"
				><i class="bi bi-arrow-left me-2"></i> Kembali ke Daftar Postingan</a
			>
		</div>
	</div>
</div>
