// scripts/seed-evaluations.js

// Import library Supabase JS Client
import { createClient } from '@supabase/supabase-js';

// Import dotenv untuk memuat variabel lingkungan dari file .env
// Pastikan file .env ada di root proyek Anda
import 'dotenv/config';

// Ambil URL Supabase dan Service Role Key dari variabel lingkungan
// VITE_PUBLIC_SUPABASE_URL diperlukan karena ini adalah variabel publik yang umum digunakan
// SUPABASE_SERVICE_KEY adalah variabel rahasia yang kita gunakan untuk seeder
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL; // Hapus "VITE_"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Menggunakan nama variabel yang Anda inginkan

// Periksa apakah variabel lingkungan yang diperlukan sudah ada
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('----------------------------------------------------');
    console.error('ERROR: Variabel lingkungan penting tidak ditemukan!');
    console.error('Pastikan Anda memiliki:');
    console.error('  - VITE_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_KEY');
    console.error('di file .env di root proyek Anda.');
    console.error('Ingat, SUPABASE_SERVICE_KEY (Service Role Key) TIDAK boleh diekspos ke publik.');
    console.error('----------------------------------------------------');
    process.exit(1); // Keluar dari proses dengan kode error
}

// Inisialisasi klien Supabase dengan Service Role Key
// Kunci ini memiliki izin bypass RLS, ideal untuk operasi seeding/admin.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fungsi untuk menghasilkan satu objek data evaluasi dummy.
 * @param {number} index - Indeks untuk membantu menghasilkan data yang sedikit berbeda.
 * @returns {object} Objek data evaluasi.
 */
const generateRandomData = (index) => {
    const names = ["Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Ira", "Joko", "Kiki", "Lia", "Maman", "Nina", "Oscar", "Putri", "Qian", "Reno", "Sari", "Tono"];
    const surnames = ["Susanto", "Pratama", "Wijaya", "Permata", "Santoso", "Muhammad", "Lestari", "Nugroho", "Kartika", "Waluyo", "Aditya", "Budiman", "Cahyani", "Dirgantara", "Effendi", "Gunawan", "Harmoni", "Indra", "Jaya", "Kusuma"];

    const randomName = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
    const initials = randomName.split(' ').map(n => n[0]).join('').toUpperCase(); // Pastikan inisial kapital
    const phoneNumber = `+62 8${Math.floor(Math.random() * 9000000000) + 1000000000}`; // Nomor telepon Indonesia dummy
    
    // Skor AI antara 70-100
    const aiScore = Math.floor(Math.random() * (100 - 70 + 1)) + 70; 
    
    // Rating manusia antara 3.0-5.0 dengan satu desimal
    const humanRating = (Math.floor(Math.random() * (50 - 30 + 1)) + 30) / 10; 

    // Tanggal evaluasi dalam 1 tahun terakhir
    const randomDaysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);

    return {
        caller_name: randomName,
        caller_initials: initials,
        phone_number: phoneNumber,
        transcript_link: `https://example.com/transcript/${index + 1}`, // Link dummy
        evaluation_date: date.toISOString().split('T')[0], // Format tanggal YYYY-MM-DD
        ai_score: aiScore,
        human_rating: humanRating
    };
};

/**
 * Fungsi utama untuk menjalankan proses seeding.
 */
const seedData = async () => {
    console.log('----------------------------------------------------');
    console.log('Memulai proses seeding data evaluations...');
    console.log('----------------------------------------------------');

    // Opsional: Hapus semua data lama sebelum menyisipkan yang baru
    // Ini memastikan tabel bersih setiap kali seeder dijalankan
    console.log('Menghapus data evaluations yang ada (jika ada)...');
    const { error: deleteError } = await supabase
        .from('evaluations')
        .delete()
        // Kondisi ini memastikan semua baris dihapus, 'neq' berarti 'not equal to'
        // '000...' adalah UUID dummy yang tidak akan pernah ada, sehingga query akan menghapus semua
        .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (deleteError) {
        console.error('❌ Gagal menghapus data lama:', deleteError.message);
        process.exit(1);
    }
    console.log('✅ Data lama berhasil dihapus.');


    // Hasilkan 20 data dummy
    const dataToInsert = Array.from({ length: 20 }, (_, i) => generateRandomData(i));

    console.log(`Menyisipkan ${dataToInsert.length} data baru ke tabel 'evaluations'...`);
    const { data, error } = await supabase
        .from('evaluations')
        .insert(dataToInsert);

    if (error) {
        console.error('❌ Gagal menyisipkan data:', error.message);
        console.error('Detail Error:', error); // Tampilkan detail error untuk debugging
        process.exit(1);
    } else {
        console.log('✅ Data berhasil disisipkan!');
        // Jika Anda ingin melihat data yang disisipkan, uncomment baris di bawah ini:
        // console.log('Data yang disisipkan:', data);
    }

    console.log('----------------------------------------------------');
    console.log('Proses seeding selesai.');
    console.log('----------------------------------------------------');
    process.exit(0); // Keluar dari skrip dengan sukses
};

// Panggil fungsi seeder saat skrip dijalankan
seedData();