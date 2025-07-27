<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

<div class="container py-4">
  <h2 class="text-center mb-5 fw-bold text-dark">Artikel Terbaru</h2>

  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {#if data.posts && data.posts.length > 0}
          {#each data.posts as post}
              <div class="col">
                  <a href="/blog/{post.slug}" class="card h-100 shadow-sm text-decoration-none">
                      {#if post.cover_image_url}
                          <img src={post.cover_image_url} class="card-img-top" alt="{post.title} cover" style="height: 200px; object-fit: cover;">
                      {:else}
                          <div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                              <i class="bi bi-image-fill text-muted" style="font-size: 3rem;"></i>
                          </div>
                      {/if}
                      <div class="card-body">
                          <h5 class="card-title text-primary fw-bold">{post.title}</h5>
                          <p class="card-text text-muted small mb-2">
                              <i class="bi bi-calendar-check me-1"></i> Published: {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p class="card-text text-dark line-clamp-3">{post.content}</p>
                      </div>
                      <div class="card-footer bg-white border-top-0">
                          <small class="text-primary fw-bold">Baca Selengkapnya <i class="bi bi-arrow-right"></i></small>
                      </div>
                  </a>
              </div>
          {/each}
      {:else}
          <div class="col-12">
              <div class="alert alert-info text-center" role="alert">
                  <h4 class="alert-heading">Belum Ada Postingan Tersedia</h4>
                  <p class="mb-0">Mohon maaf, saat ini belum ada postingan yang bisa ditampilkan.</p>
              </div>
          </div>
      {/if}
  </div>
</div>