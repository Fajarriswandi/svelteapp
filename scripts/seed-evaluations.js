// scripts/seed-evaluations.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL; 
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('----------------------------------------------------');
    console.error('ERROR: Variabel lingkungan penting tidak ditemukan!');
    console.error('Pastikan Anda memiliki:');
    console.error('  - VITE_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_KEY');
    console.error('di file .env Anda. Ingat, SUPABASE_SERVICE_KEY (Service Role Key) TIDAK boleh diekspos ke publik.');
    console.error('----------------------------------------------------');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const generateRandomData = (index) => {
    const names = ["Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Ira", "Joko", "Kiki", "Lia", "Maman", "Nina", "Oscar", "Putri", "Qian", "Reno", "Sari", "Tono"];
    const surnames = ["Susanto", "Pratama", "Wijaya", "Permata", "Santoso", "Muhammad", "Lestari", "Nugroho", "Kartika", "Waluyo", "Aditya", "Budiman", "Cahyani", "Dirgantara", "Effendi", "Gunawan", "Harmoni", "Indra", "Jaya", "Kusuma"];

    const randomName = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
    const initials = randomName.split(' ').map(n => n[0]).join('').toUpperCase();
    const phoneNumber = `+62 8${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    const aiScore = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
    const humanRating = (Math.floor(Math.random() * (50 - 30 + 1)) + 30) / 10;

    const randomDaysAgo = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);

    return {
        caller_name: randomName,
        caller_initials: initials,
        phone_number: phoneNumber,
        transcript_link: `https://example.com/transcript/${index + 1}`,
        evaluation_date: date.toISOString().split('T')[0],
        ai_score: aiScore,
        human_rating: humanRating
    };
};

/**
 * Fungsi untuk menghasilkan detail evaluasi (sub-kategori rating) untuk satu evaluasi.
 * @param {string} evaluationId - ID dari evaluasi induk.
 * @returns {Array<object>} Array objek detail evaluasi.
 */
const generateEvaluationDetails = (evaluationId) => {
    const categories = [
        { key: 'accuracy', name: 'Accuracy of Response', question: 'Did the AI understand the user\'s intent correctly? Was the answer factually and contextually correct?', icon: 'target' },
        { key: 'relevance', name: 'Relevance & Coherence', question: 'Did the response stay on-topic? Was it logically coherent?', icon: 'chat-quote' },
        { key: 'tone', name: 'Tone & Politeness', question: 'Was the tone appropriate (e.g., friendly, professional)?', icon: 'headset' },
        { key: 'resolution', name: 'Resolution Effectiveness', question: 'Did the conversation solve the user\'s issue?', icon: 'patch-check' },
        { key: 'escalation', name: 'Escalation Appropriateness', question: 'Was a human handover triggered when needed?', icon: 'exclamation-triangle' }
    ];

    return categories.map(cat => ({
        evaluation_id: evaluationId,
        category_key: cat.key,
        category_name: cat.name,
        category_question: cat.question,
        rating: (Math.floor(Math.random() * (50 - 30 + 1)) + 30) / 10, // Rating 3.0 - 5.0
        icon_name: cat.icon
    }));
};

const seedData = async () => {
    console.log('----------------------------------------------------');
    console.log('Memulai proses seeding data evaluations dan details...');
    console.log('----------------------------------------------------');

    // Hapus data lama dari evaluation_details terlebih dahulu (karena ada FK)
    console.log('Menghapus data evaluation_details yang ada...');
    const { error: deleteDetailsError } = await supabase
        .from('evaluation_details')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteDetailsError) {
        console.error('❌ Gagal menghapus data evaluation_details lama:', deleteDetailsError.message);
        process.exit(1);
    }
    console.log('✅ Data evaluation_details lama berhasil dihapus.');


    // Hapus data lama dari evaluations
    console.log('Menghapus data evaluations yang ada...');
    const { error: deleteEvaluationsError } = await supabase
        .from('evaluations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteEvaluationsError) {
        console.error('❌ Gagal menghapus data evaluations lama:', deleteEvaluationsError.message);
        process.exit(1);
    }
    console.log('✅ Data evaluations lama berhasil dihapus.');


    // Sisipkan data evaluations
    const evaluationsToInsert = Array.from({ length: 20 }, (_, i) => generateRandomData(i));
    console.log(`Menyisipkan ${evaluationsToInsert.length} data evaluations baru...`);
    const { data: insertedEvaluations, error: insertEvaluationsError } = await supabase
        .from('evaluations')
        .insert(evaluationsToInsert)
        .select('id'); // PENTING: Minta ID dari baris yang baru disisipkan

    if (insertEvaluationsError) {
        console.error('❌ Gagal menyisipkan data evaluations:', insertEvaluationsError.message);
        process.exit(1);
    }
    console.log('✅ Data evaluations berhasil disisipkan.');

    // Sisipkan data evaluation_details untuk setiap evaluasi yang baru disisipkan
    const allDetailsToInsert = [];
    if (insertedEvaluations) {
        for (const evaluation of insertedEvaluations) {
            const details = generateEvaluationDetails(evaluation.id);
            allDetailsToInsert.push(...details);
        }
    }

    if (allDetailsToInsert.length > 0) {
        console.log(`Menyisipkan ${allDetailsToInsert.length} data evaluation_details baru...`);
        const { error: insertDetailsError } = await supabase
            .from('evaluation_details')
            .insert(allDetailsToInsert);

        if (insertDetailsError) {
            console.error('❌ Gagal menyisipkan data evaluation_details:', insertDetailsError.message);
            process.exit(1);
        }
        console.log('✅ Data evaluation_details berhasil disisipkan.');
    } else {
        console.log('Tidak ada data evaluation_details untuk disisipkan.');
    }

    console.log('----------------------------------------------------');
    console.log('Proses seeding selesai.');
    console.log('----------------------------------------------------');
    process.exit(0);
};

seedData();