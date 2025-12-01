// src/scripts/features/recommendation.js
import { apiGet } from '../utils/api.js';

export async function initRecommendationSection() {
    const container = document.getElementById('recommendation-container');
    if (!container) return;

    // 1. Cek User di LocalStorage
    const userStr = localStorage.getItem('paketin_user');
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            
            // Tampilkan container (loading state)
            container.classList.remove('hidden');

            // 2. Fetch ke Backend
            // Backend sudah menjamin minimal 4 data (lewat fallback), atau lebih jika user sultan
            const res = await apiGet(`/recommendations/${user.id}`);

            if (res.ok && res.data.data && res.data.data.length > 0) {
                const allProducts = res.data.data;
                
                // --- LOGIKA UI HOME ---
                // 1. Ambil maksimal 4 produk saja untuk ditampilkan
                const productsToShow = allProducts.slice(0, 4);
                
                // 2. Cek apakah aslinya lebih dari 4?
                const hasMore = allProducts.length > 4;

                renderRecommendationHTML(productsToShow, container, hasMore);
            } else {
                // Jika benar-benar kosong (API error / Database kosong total)
                container.classList.add('hidden');
            }

        } catch (e) {
            console.error("Gagal ambil rekomendasi:", e);
            container.classList.add('hidden');
        }
    }
}

// Helper Render HTML
function renderRecommendationHTML(products, container, hasMore) {
    const productCardsHtml = products.map(product => {
        // Logika Badge & Style
        const isPulsa = product.type === 'CREDIT' || (product.category || '').includes('Top-up');
        const badgeColor = isPulsa ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200';
        const badgeText = isPulsa ? 'Pulsa' : 'Kuota';
        const iconClass = isPulsa ? 'fa-mobile-screen text-yellow-600' : 'fa-wifi text-blue-600';
        const imageSrc = product.image || "https://placehold.co/400x300?text=No+Image";
        const price = 'Rp ' + Number(product.price).toLocaleString('id-ID');

        return `
        <div class="min-w-[260px] w-[260px] md:w-auto md:min-w-0 snap-center transition-transform hover:-translate-y-1 duration-300">
            <a href="/produk/${product.id}" class="block relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full group overflow-hidden">
                <figure class="w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    <img src="${imageSrc}" alt="${product.product_name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                        <i class="fa-solid ${iconClass} text-xs"></i>
                    </div>
                </figure>
                <div class="p-4 flex flex-col flex-1 h-[180px]">
                    <div class="flex justify-between items-start mb-1 gap-2">
                        <div>
                             <span class="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">${product.category}</span>
                            <h5 class="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1" title="${product.product_name}">${product.product_name}</h5>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${badgeColor}">
                            ${badgeText}
                        </span>
                    </div>
                    <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 mt-1">${product.description || ''}</p>
                    <p class="text-blue-600 dark:text-blue-400 font-bold mt-auto text-lg">${price}</p>
                    <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <span class="text-xs font-bold text-primary">Beli Sekarang</span>
                        <i class="fa-solid fa-arrow-right text-xs text-primary"></i>
                    </div>
                </div>
            </a>
        </div>
        `;
    }).join('');

    // Logika Tombol "Lihat Lebih Banyak"
    const seeMoreButton = hasMore ? `
        <div class="mt-6 text-center">
            <a href="/kategori/rekomendasi" class="btn btn-outline btn-sm rounded-full px-6 normal-case border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                Lihat Lebih Banyak <i class="fa-solid fa-arrow-right ml-2"></i>
            </a>
        </div>
    ` : '';

    container.innerHTML = `
        <section class="relative mt-8 mb-8 mx-1 py-6 px-4 rounded-3xl border-2 border-dashed border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/20 dark:to-blue-950/20">
            
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -mr-10 -mt-10"></div>

            <div class="absolute -top-4 left-4 md:left-8 z-10">
                <div class="relative flex items-center justify-center">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <div class="relative inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-full shadow-lg">
                        <span>✨ Spesial Untukmu</span>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-end mb-6 pt-4 relative z-10">
                <div>
                    <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Pilihan AI Cerdas 🤖</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Dikurasi berdasarkan kebiasaan belanjamu</p>
                </div>
            </div>
            
            <div class="flex overflow-x-auto pb-4 -mx-2 px-2 gap-4 snap-x scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible relative z-10">
                ${productCardsHtml}
            </div>

            ${seeMoreButton}
            
        </section>
    `;
}