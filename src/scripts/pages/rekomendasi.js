// src/scripts/pages/rekomendasi.js
import { apiGet } from '../utils/api.js';

export async function initRecommendationPage() {
    const container = document.getElementById('recommendation-content');
    const loadingSkeleton = document.getElementById('loading-skeleton');

    // 1. Cek Login
    const userStr = localStorage.getItem('paketin_user');
    if (!userStr) {
        alert("Silakan login untuk melihat rekomendasi.");
        window.location.href = '/auth/login';
        return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    try {
        // 2. FETCH DATA PARALEL
        const [resRecom, resAll] = await Promise.all([
            apiGet(`/recommendations/${userId}`), // Pakai apiGet wrapper
            apiGet(`/products`)
        ]);

        // Unwrap data dari apiGet
        const dataRecom = resRecom.ok ? (resRecom.data || {}) : {};
        const dataAll = resAll.ok ? (resAll.data || {}) : {};
        
        const rawRecom = dataRecom.data || []; // Ini array hasil gabungan (Context + ML)
        const rawAll = dataAll.data || [];
        const contextSource = dataRecom.context_based_on; // Nama produk terakhir (jika ada)

        // --- LOGIC PEMBAGIAN SECTION ---
        
        let contextPicks = [];
        let mlPicks = [];
        const usedProductIds = new Set();

        // A. Pisahkan Context vs ML Murni
        // Backend menaruh Context product di awal. Kita ambil 2-3 pertama jika contextSource ada.
        if (contextSource && contextSource !== "None" && rawRecom.length > 0) {
            // Ambil 2 produk pertama sebagai "Mirip Pembelian Terakhir"
            contextPicks = rawRecom.slice(0, 2);
            // Sisanya masuk ke ML Picks
            mlPicks = rawRecom.slice(2);
        } else {
            // Jika tidak ada history, semua masuk ML Picks
            mlPicks = rawRecom;
        }

        // Catat ID agar tidak duplikat
        contextPicks.forEach(p => usedProductIds.add(p.id));
        mlPicks.forEach(p => usedProductIds.add(p.id));

        // Hitung target price dari data ML untuk section budget
        let userTargetPrice = 50000;
        let targetCategory = "General Offer";
        if (rawRecom.length > 0) {
            const totalPrice = rawRecom.reduce((sum, p) => sum + Number(p.price), 0);
            userTargetPrice = totalPrice / rawRecom.length;
            targetCategory = rawRecom[0].category;
        }

        // B. Budget Picks (Exclude yg sudah muncul)
        const budgetPicks = rawAll.filter(p => {
            if (usedProductIds.has(p.id)) return false;
            const price = Number(p.price);
            return price >= (userTargetPrice * 0.7) && price <= (userTargetPrice * 1.3);
        }).slice(0, 4);
        budgetPicks.forEach(p => usedProductIds.add(p.id));

        // C. Cheap Picks
        const cheapPicks = rawAll.filter(p => !usedProductIds.has(p.id) && p.category === targetCategory)
            .sort((a, b) => Number(a.price) - Number(b.price))
            .slice(0, 4);
        cheapPicks.forEach(p => usedProductIds.add(p.id));

        // D. Trending Picks
        const trendingPicks = rawAll.filter(p => !usedProductIds.has(p.id))
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        // 4. RENDER HTML
        if(loadingSkeleton) loadingSkeleton.classList.add('hidden');
        if(container) container.innerHTML = ''; // Bersihkan container

        // SECTION 1: CONTEXT (Jika Ada)
        if (contextPicks.length > 0) {
            container.insertAdjacentHTML('beforeend', createSectionHTML({
                title: "Karena Kamu Membeli",
                subtitle: contextSource, // Nama produk terakhir
                iconClass: "fa-history",
                iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                products: contextPicks,
                isHighlight: false // Tampil standar
            }));
        }

        // SECTION 2: AI PICKS (Highlight Utama)
        if (mlPicks.length > 0) {
            container.insertAdjacentHTML('beforeend', createSectionHTML({
                title: "Rekomendasi Cerdas AI",
                subtitle: "Dipilih khusus berdasarkan profilmu",
                iconClass: "fa-wand-magic-sparkles",
                iconBg: "bg-indigo-600 text-white",
                products: mlPicks,
                isHighlight: true // Tampil mencolok
            }));
        }

        // SECTION 3: BUDGET
        if (budgetPicks.length > 0) {
            container.insertAdjacentHTML('beforeend', createSectionHTML({
                title: "Sesuai Budgetmu",
                subtitle: `Kisaran Rp ${userTargetPrice.toLocaleString('id-ID')}`,
                iconClass: "fa-wallet",
                iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                products: budgetPicks
            }));
        }

        // SECTION 4: HEMAT
        if (cheapPicks.length > 0) {
            container.insertAdjacentHTML('beforeend', createSectionHTML({
                title: "Paling Hemat",
                subtitle: "Harga terbaik di kategori ini",
                iconClass: "fa-tags",
                iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                products: cheapPicks
            }));
        }

        // SECTION 5: TRENDING
        if (trendingPicks.length > 0) {
            container.insertAdjacentHTML('beforeend', createSectionHTML({
                title: "Sedang Trending",
                subtitle: "Paling laris saat ini",
                iconClass: "fa-fire",
                iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                products: trendingPicks
            }));
        }

        // Init Scripts
        initLoadMore();
        initLiveSearch();

    } catch (e) {
        console.error("Gagal render rekomendasi:", e);
        if(loadingSkeleton) loadingSkeleton.innerHTML = "<p class='text-center text-red-500'>Gagal memuat data.</p>";
    }
}

// --- HELPER FUNCTIONS ---

function createSectionHTML({ title, subtitle, iconClass, iconBg, products, isHighlight = false }) {
    const cardHTML = products.map((p, i) => createCardHTML(p, i)).join('');
    
    const containerClass = isHighlight 
        ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-300 dark:border-indigo-700" 
        : "bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700";

    // Jika produk > 4, tampilkan tombol load more
    const loadMoreBtn = products.length > 4 
        ? `<div class="mt-6 text-center load-more-wrapper">
             <button class="btn btn-outline btn-sm rounded-full px-6 normal-case btn-load-more">Lihat Semua</button>
           </div>` 
        : '';

    return `
    <section class="searchable-section section-expandable rounded-3xl p-5 md:p-8 relative ${containerClass} mb-8">
        ${isHighlight ? `
        <div class="absolute top-4 right-4">
            <span class="flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
        </div>` : ''}

        <div class="flex items-center gap-3 mb-6 ${!isHighlight ? 'pb-4 border-b border-gray-100 dark:border-gray-700' : ''}">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${iconBg}">
                <i class="fa-solid ${iconClass} text-lg"></i>
            </div>
            <div>
                <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">${title}</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">${subtitle}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 product-grid">
            ${cardHTML}
        </div>
        ${loadMoreBtn}
    </section>
    `;
}

function createCardHTML(prod, index) {
    const isHidden = index >= 4 ? 'hidden mobile-hide' : '';
    const priceFmt = 'Rp ' + Number(prod.price).toLocaleString('id-ID');
    const imageSrc = prod.image || "https://placehold.co/400x300?text=No+Image";
    
    const isPulsa = prod.type === 'CREDIT' || (prod.category||'').includes('Top-up');
    const badgeColor = isPulsa ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    const badgeText = isPulsa ? 'Pulsa' : 'Kuota';
    const iconClass = isPulsa ? 'fa-mobile-screen text-yellow-600' : 'fa-wifi text-blue-600';

    return `
    <div class="product-item h-full ${isHidden}" data-name="${prod.product_name.toLowerCase()}">
        <a href="/produk/${prod.id}" class="block relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all h-full group overflow-hidden">
            <figure class="w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                <img src="${imageSrc}" alt="${prod.product_name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute top-2 left-2 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                    <i class="fa-solid ${iconClass} text-xs"></i>
                </div>
            </figure>
            <div class="p-4 flex flex-col flex-1 h-[180px]">
                <div class="flex justify-between items-start mb-1 gap-2">
                    <div>
                        <span class="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">${prod.category}</span>
                        <h5 class="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1" title="${prod.product_name}">${prod.product_name}</h5>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${badgeColor}">
                        ${badgeText}
                    </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">${prod.description || ''}</p>
                <p class="text-blue-600 dark:text-blue-400 font-bold mt-auto text-lg">${priceFmt}</p>
                
                <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                     <span class="text-xs font-bold text-primary">Beli Sekarang</span>
                     <i class="fa-solid fa-arrow-right text-xs text-primary"></i>
                </div>
            </div>
        </a>
    </div>
    `;
}

export function initLiveSearch() {
    const searchInput = document.getElementById('search-bar');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.product-item');

        cards.forEach(card => {
            const name = card.dataset.name;
            if (name.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}


export function initLoadMore() {
    const sections = document.querySelectorAll('.section-expandable');
    sections.forEach(section => {
        const btn = section.querySelector('.btn-load-more');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const hiddenItems = section.querySelectorAll('.mobile-hide');
            hiddenItems.forEach(item => {
                item.classList.remove('hidden');
                item.classList.add('animate-in', 'fade-in');
            });
            btn.parentElement.classList.add('hidden');
        });
    });
}