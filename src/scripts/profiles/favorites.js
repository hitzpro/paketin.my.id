// src/scripts/profiles/favorites.js
import { apiGet } from "../utils/api.js";

export function initFavorites(user) {
    const tabFavorites = document.getElementById("tab-favorites");
    const favoritesGrid = document.getElementById("favorites-grid");
    const favoritesEmpty = document.getElementById("favorites-empty");

    if (!tabFavorites) return;

    // Cek flag agar tidak double listener saat page transition
    if (tabFavorites.dataset.listenerAttached === "true") return;
    
    tabFavorites.addEventListener("click", () => {
        loadFavorites();
    });
    tabFavorites.dataset.listenerAttached = "true";

    async function loadFavorites() {
        if (!favoritesGrid) return;

        // Show Loading UI
        favoritesEmpty?.classList.add("hidden");
        favoritesGrid.classList.remove("hidden");
        favoritesGrid.innerHTML = `
            <div class="col-span-full text-center py-10">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
        `;

        // --- FETCH PAKE WRAPPER ---
        const res = await apiGet(`/favorites/${user.id}`);

        if (res.ok) {
            const data = res.data.data || res.data || []; // Handle struktur response { data: [...] }
            
            favoritesGrid.innerHTML = ""; // Clear loading

            if (data.length === 0) {
                favoritesGrid.classList.add("hidden");
                favoritesEmpty.classList.remove("hidden");
                return;
            }

            favoritesEmpty.classList.add("hidden");
            favoritesGrid.classList.remove("hidden");

            // Render Card
            const fragment = document.createDocumentFragment();
            data.forEach(prod => {
                // Kita inject HTML string ke dalam wrapper div temporary lalu append ke fragment
                // atau cara string concat biasa ke innerHTML (lebih simpel)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = createCardHTML(prod);
                fragment.appendChild(tempDiv.firstElementChild);
            });
            favoritesGrid.appendChild(fragment);

        } else {
            console.error("Gagal load favorites:", res.error);
            favoritesGrid.innerHTML = `<div class="col-span-full text-center text-red-500">Gagal memuat data favorit.</div>`;
        }
    }

    // Helper HTML Card (Sama persis dengan ProductCard.astro logic)
    function createCardHTML(prod) {
        const id = prod.id;
        const title = escapeHtml(prod.product_name || 'Produk');
        const description = escapeHtml(prod.description || 'Tidak ada deskripsi');
        const priceRaw = Number(prod.price);
        const price = isNaN(priceRaw) ? prod.price : `Rp ${priceRaw.toLocaleString('id-ID')}`;
        const imageSrc = prod.image || "https://placehold.co/400x300?text=No+Image";
        
        // Logic Kategori
        const isPulsa = prod.type === 'CREDIT' || (prod.category || '').toLowerCase() === 'top-up promo';
        
        const badgeClass = isPulsa ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200';
        const badgeText = isPulsa ? 'Pulsa' : 'Kuota';
        const iconClass = isPulsa ? 'fa-mobile-screen text-yellow-600' : 'fa-wifi text-blue-600';

        // Gunakan Template Literal yang rapi
        return `
        <div class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col h-full group overflow-hidden cursor-pointer" onclick="window.location.href='/produk/${id}'">
            <figure class="w-full h-36 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                <img src="${imageSrc}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute top-2 left-2 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                    <i class="fa-solid ${iconClass} text-xs"></i>
                </div>
            </figure>
            <div class="p-4 flex flex-col flex-1">
                <div class="flex justify-between items-start mb-1 gap-2">
                    <div>
                         <span class="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">${prod.category}</span>
                        <h2 class="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1">${title}</h2>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap border ${badgeClass}">
                        ${badgeText}
                    </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 mt-1">${description}</p>
                <p class="text-blue-600 dark:text-blue-400 font-bold mt-auto text-lg">${price}</p>
            </div>
        </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}