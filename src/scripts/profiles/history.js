// src/scripts/profiles/history.js
import { apiGet } from "../utils/api.js";

export function initHistory(user) {
    const tabHistory = document.getElementById("tab-history");
    const historyList = document.getElementById("history-list");
    const historyLoading = document.getElementById("history-loading");
    const historyEmpty = document.getElementById("history-empty");
    
    const filterCategory = document.getElementById("history-filter-category");
    const sortDate = document.getElementById("history-sort-date");

    let rawData = [];

    if (!tabHistory) return;

    // Hindari multiple fetch dengan flag sederhana
    if (!tabHistory.dataset.hasListener) {
        tabHistory.addEventListener("click", () => {
            // Load jika data masih kosong
            if (rawData.length === 0) loadHistory();
        });
        tabHistory.dataset.hasListener = "true";
    }

    async function loadHistory() {
        // UI State: Loading
        if (historyList) historyList.innerHTML = "";
        if (historyEmpty) historyEmpty.classList.add("hidden");
        if (historyLoading) historyLoading.classList.remove("hidden");

        // --- API CALL ---
        const res = await apiGet(`/transactions/history/${user.id}`);

        if (res.ok) {
            // Sukses
            const json = res.data;
            rawData = (json && json.data) ? json.data : [];
        } else {
            // Gagal
            console.error("loadHistory error:", res.error);
            rawData = [];
            if (historyList) historyList.innerHTML = `<div class="text-center text-red-500 text-sm py-4">Gagal memuat riwayat.</div>`;
        }

        // Selesai Loading
        if (historyLoading) historyLoading.classList.add("hidden");
        
        // Render awal
        render();
    }

    function render() {
        if (!historyList) return;
        historyList.innerHTML = "";

        // 1. Filter
        let filtered = Array.from(rawData);
        if (filterCategory && filterCategory.value && filterCategory.value !== "all") {
            const cat = filterCategory.value.toLowerCase();
            // Handle filter Pulsa vs Kuota
            filtered = filtered.filter(t => {
                const type = t.products?.type; // Asumsi backend kirim type
                const category = (t.products?.category || "").toLowerCase();
                
                if (cat === 'pulsa') return type === 'CREDIT' || category === 'top-up promo';
                if (cat === 'kuota') return type === 'DATA';
                return category === cat;
            });
        }

        // 2. Sort
        const sort = (sortDate && sortDate.value) ? sortDate.value : "newest";
        filtered.sort((a, b) => {
            const ta = new Date(a.created_at).getTime();
            const tb = new Date(b.created_at).getTime();
            return sort === "newest" ? tb - ta : ta - tb;
        });

        // 3. Empty State
        if (filtered.length === 0) {
            if (rawData.length === 0) {
                if (historyEmpty) historyEmpty.classList.remove("hidden");
            } else {
                historyList.innerHTML = `
                    <div class="text-center py-12 opacity-60">
                        <i class="fa-solid fa-filter-circle-xmark text-4xl text-gray-300 mb-2"></i>
                        <p class="text-sm text-gray-500">Tidak ada transaksi filter ini.</p>
                    </div>
                `;
            }
            return;
        }

        // 4. Render Items
        const fragment = document.createDocumentFragment();
        
        filtered.forEach(t => {
            const wrapper = document.createElement("div");
            // Styling card history
            wrapper.className = "bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center hover:shadow-md transition-all";
            
            const prodName = t.products?.product_name || "Produk Terhapus";
            const dateStr = new Date(t.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const priceStr = Number(t.total_price).toLocaleString('id-ID');

            // Badge Status
            let statusBadge = "";
            if (t.is_paid) {
                statusBadge = `<span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Lunas</span>`;
            } else {
                statusBadge = `<a href="/payment/${t.id}" class="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-bold rounded-md transition-colors">Bayar</a>`;
            }

            wrapper.innerHTML = `
                <div class="flex flex-col gap-1">
                    <div class="font-bold text-gray-800 dark:text-gray-200 text-sm">${escapeHtml(prodName)}</div>
                    <div class="text-xs text-gray-400 flex items-center gap-1">
                        <i class="fa-regular fa-clock text-[10px]"></i> ${escapeHtml(dateStr)}
                    </div>
                </div>

                <div class="flex flex-col items-end gap-1">
                    <span class="font-bold text-blue-600 dark:text-blue-400">Rp ${priceStr}</span>
                    ${statusBadge}
                </div>
            `;
            fragment.appendChild(wrapper);
        });

        historyList.appendChild(fragment);
    }

    // Event Listeners (Clone Node agar bersih)
    if (filterCategory) {
        const newFilter = filterCategory.cloneNode(true);
        filterCategory.parentNode.replaceChild(newFilter, filterCategory);
        newFilter.addEventListener("change", render);
    }
    
    if (sortDate) {
        const newSort = sortDate.cloneNode(true);
        sortDate.parentNode.replaceChild(newSort, sortDate);
        newSort.addEventListener("change", render);
    }
}

function escapeHtml(str) {
    if(!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}