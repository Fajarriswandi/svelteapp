// scripts/seed-evaluations.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Pastikan dotenv terinstal: npm install dotenv

// Ambil kredensial dari environment variables
// Pastikan file .env Anda memiliki:
// PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
// SUPABASE_SERVICE_KEY="your-service-role-key" (Ini yang digunakan untuk seeding)
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL; // PERBAIKAN: Menggunakan PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Menggunakan Service Role Key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('----------------------------------------------------');
    console.error('ERROR: Variabel lingkungan penting tidak ditemukan!');
    console.error('Pastikan Anda memiliki:');
    console.error('  - PUBLIC_SUPABASE_URL'); // Diperbarui pesan error
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
        { key: 'tone', name: 'Tone & Politiness', question: 'Was the tone appropriate (e.g., friendly, professional)?', icon: 'headset' },
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

/**
 * Fungsi untuk menghasilkan data riwayat evaluasi (chat/call transcript) untuk satu evaluasi.
 * @param {string} evaluationId - ID dari evaluasi induk.
 * @returns {Array<object>} Array objek riwayat evaluasi.
 */
const generateEvaluationHistory = (evaluationId) => {
    const histories = [
        {
            type: 'chat',
            content: `[09:01] Customer: Hello, I have a question about my account.
[09:02] AI Agent: Sure, please go ahead.
[09:03] Customer: I need to update my payment method.
[09:04] AI Agent: No problem! I will assist you with that.
[09:05] Customer: I would like to change it to a different credit card.
[09:06] AI Agent: Okay, I can help you update your credit card information.
[09:07] Customer: Thank you!
[09:08] AI Agent: You're welcome! Is there anything else I can help you with?`
        },
        {
            type: 'call',
            content: `[09:10] Customer: I can't access my account from the app.
[09:11] AI Agent: Let me check that for you. Can you confirm your email address?
[09:12] AI Agent: It's fajar.muhammad@email.com
[09:13] AI Agent: Thank you. I've reset your access. Please try again now.
[09:14] AI Agent: It works! Thanks a lot.
[09:15] AI Agent: Glad to help that! Let us know if you need anything else.`
        }
    ];
    return histories.map(h => ({
        evaluation_id: evaluationId,
        type: h.type,
        content: h.content
    }));
};


const seedData = async () => {
    console.log('----------------------------------------------------');
    console.log('Memulai proses seeding data evaluations, details, dan history...');
    console.log('----------------------------------------------------');

    // Urutan penghapusan penting karena Foreign Keys
    console.log('Menghapus data evaluation_history yang ada...');
    const { error: deleteHistoryError } = await supabase
        .from('evaluation_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteHistoryError) {
        console.error('❌ Gagal menghapus data evaluation_history lama:', deleteHistoryError.message);
        process.exit(1);
    }
    console.log('✅ Data evaluation_history lama berhasil dihapus.');


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


    // Sisipkan data evaluations terlebih dahulu untuk mendapatkan ID yang valid
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

    // Sisipkan data evaluation_details dan evaluation_history untuk setiap evaluasi yang baru disisipkan
    const allDetailsToInsert = [];
    const allHistoryToInsert = [];

    if (insertedEvaluations) {
        for (const evaluation of insertedEvaluations) {
            // Generate details
            const details = generateEvaluationDetails(evaluation.id);
            allDetailsToInsert.push(...details);

            // Generate history
            const histories = generateEvaluationHistory(evaluation.id);
            allHistoryToInsert.push(...histories);
        }
    }
    
    // Sisipkan semua detail
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

    // Sisipkan semua history
    if (allHistoryToInsert.length > 0) {
        console.log(`Menyisipkan ${allHistoryToInsert.length} data evaluation_history baru...`);
        const { error: insertHistoryError } = await supabase
            .from('evaluation_history')
            .insert(allHistoryToInsert);

        if (insertHistoryError) {
            console.error('❌ Gagal menyisipkan data evaluation_history:', insertHistoryError.message);
            process.exit(1);
        }
        console.log('✅ Data evaluation_history berhasil disisipkan.');
    } else {
        console.log('Tidak ada data evaluation_history untuk disisipkan.');
    }

    console.log('----------------------------------------------------');
    console.log('Proses seeding selesai.');
    console.log('----------------------------------------------------');
    process.exit(0);
};

seedData();
