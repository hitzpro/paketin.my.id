// src/scripts/products/list.js

export function initProductList() {
    const container = document.getElementById('product-list-container');
    if (!container) return;

    // 1. State & Config
    const rawData = JSON.parse(container.getAttribute('data-products') || '[]');
    let initialCat = container.getAttribute('data-category') || 'all';
    let searchQuery = container.getAttribute('data-query') || '';
    
    if (initialCat !== 'all') initialCat = initialCat.toLowerCase();

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let filteredData = [];
    let currentSort = 'default';

    // Elements
    const grid = document.getElementById('products-grid');
    const searchInput = document.getElementById('local-search');
    const sortSelect = document.getElementById('sort-select');
    const btnLoadMore = document.getElementById('btn-load-more');
    const emptyState = document.getElementById('empty-state');
    const endMsg = document.getElementById('end-of-list');

    // 2. Logic Filter & Sort
    function applyFilters() {
        // A. Filter by Category & Search
        filteredData = rawData.filter(item => {
            let matchCat = true;

            // Logika Filter Baru (Based on Type or Category)
            if (initialCat !== 'all') {
                if (initialCat === 'pulsa') {
                    // Jika filter 'pulsa', cari type CREDIT atau kategori Top-up Promo
                    matchCat = item.type === 'CREDIT' || item.category === 'Top-up Promo';
                } else if (initialCat === 'kuota') {
                    // Jika filter 'kuota', cari type DATA
                    matchCat = item.type === 'DATA';
                } else {
                    // Jika kategori spesifik lain (misal dari search result)
                    matchCat = item.category.toLowerCase() === initialCat;
                }
            }

            const matchSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCat && matchSearch;
        });

        // B. Sorting
        if (currentSort === 'price-asc') {
            filteredData.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-desc') {
            filteredData.sort((a, b) => b.price - a.price);
        } else if (currentSort === 'name-asc') {
            filteredData.sort((a, b) => a.product_name.localeCompare(b.product_name));
        }

        // Reset Page
        currentPage = 1;
        renderGrid(true);
    }

    // 3. Logic Render
    function renderGrid(reset = false) {
        if (reset) {
            grid.innerHTML = '';
        }

        const end = currentPage * ITEMS_PER_PAGE;
        const dataToShow = filteredData.slice(0, end);

        if (filteredData.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            btnLoadMore.classList.add('hidden');
            endMsg.classList.add('hidden');
            return;
        } 
        
        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Render HTML String
        const html = dataToShow.map(prod => {
            // Logic Badge Warna & Teks (Dinamis dari Type)
            const isPulsa = prod.type === 'CREDIT' || prod.category === 'Top-up Promo';
            const badgeColor = isPulsa ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'; 
            
            const badgeText = isPulsa ? 'Pulsa' : 'Kuota';
            const iconClass = isPulsa ? 'fa-mobile-screen' : 'fa-wifi';
            const iconColorClass = isPulsa ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400';

            const priceFmt = 'Rp ' + Number(prod.price).toLocaleString('id-ID');
            const imageSrc = prod.image || "https://placehold.co/400x300?text=No+Image";

            return `
            <div class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full group overflow-hidden animate-in fade-in duration-500">
                <figure class="w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    <img src="${imageSrc}" alt="${prod.product_name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute top-2 left-2 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                        <i class="fa-solid ${iconClass} ${iconColorClass} text-xs"></i>
                    </div>
                </figure>
                <div class="p-4 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-1 gap-2">
                        <div>
                            <span class="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">${prod.category}</span>
                            <h5 class="font-bold text-gray-800 dark:text-gray-100 text-sm sm:text-base line-clamp-1" title="${prod.product_name}">${prod.product_name}</h5>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${badgeColor}">
                            ${badgeText}
                        </span>
                    </div>
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-1 line-clamp-2 mb-2 mt-1">${prod.description || 'Deskripsi produk...'}</p>
                    <p class="text-primary dark:text-blue-400 font-bold mt-auto text-lg">${priceFmt}</p>
                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                        <a href="/produk/${prod.id}" class="btn btn-primary btn-sm px-4 text-white rounded-md no-underline flex-1 mr-2">Beli</a>
                        <button class="btn btn-ghost btn-sm p-2 rounded-md btn-wishlist text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600" data-product-id="${prod.id}">
                            <i class="fa-regular fa-heart text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        grid.innerHTML = html;

        if (end >= filteredData.length) {
            btnLoadMore.classList.add('hidden');
            endMsg.classList.remove('hidden');
        } else {
            btnLoadMore.classList.remove('hidden');
            endMsg.classList.add('hidden');
        }
    }

    // 4. Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value; 
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFilters();
        });
    }

    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            currentPage++;
            renderGrid(false); 
        });
    }

    // Init
    applyFilters();
}