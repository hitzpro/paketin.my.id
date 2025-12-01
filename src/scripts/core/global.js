// src/scripts/core/global.js
import { apiGet, apiPost } from '../utils/api.js';
import { API_BASE_URL } from '../../config.js';

export function initGlobalScripts() {
    syncWishlistState();
    initServiceWorker();
}

/* -----------------------------------------------------------
   1. SYNC WISHLIST STATE (pakai apiGet)
----------------------------------------------------------- */
async function syncWishlistState() {
    const userStr = localStorage.getItem('paketin_user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const buttons = document.querySelectorAll('.btn-wishlist');
    if (buttons.length === 0) return;

    try {
        const res = await apiGet(`/favorites/${user.id}`);

        if (res.ok) {
            // PERBAIKAN DI SINI:
            // res.data adalah payload JSON dari server ({ data: [...] })
            // Jadi array produk ada di res.data.data
            const favoritesList = res.data.data || []; 
            
            // Pastikan favoritesList benar-benar array sebelum di-map
            if (!Array.isArray(favoritesList)) {
                console.error("Format data favorit salah:", favoritesList);
                return;
            }

            const favoritedIds = favoritesList.map(item => Number(item.id));

            buttons.forEach(btn => {
                const pid = Number(btn.dataset.productId);
                const icon = btn.querySelector('i');

                if (favoritedIds.includes(pid)) {
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid', 'text-red-500');
                } else {
                    icon.classList.add('fa-regular');
                    icon.classList.remove('fa-solid', 'text-red-500');
                }
            });
        } else {
            console.error("Gagal fetch wishlist:", res.error);
        }

    } catch (error) {
        console.error("Wishlist Sync Gagal:", error);
    }
}

/* -----------------------------------------------------------
   2. GLOBAL CLICK LISTENER (event delegation)
----------------------------------------------------------- */
if (typeof window !== 'undefined' && !window.wishlistListenerAttached) {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-wishlist');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        handleWishlistClick(btn);
    });

    window.wishlistListenerAttached = true;
}

/* -----------------------------------------------------------
   3. HANDLE TOGGLE WISHLIST — pakai apiPost
----------------------------------------------------------- */
async function handleWishlistClick(btn) {
    const userStr = localStorage.getItem('paketin_user');
    if (!userStr) {
        window.location.href = "/auth/login";
        return;
    }

    const user = JSON.parse(userStr);
    const productId = btn.dataset.productId;
    const icon = btn.querySelector('i');
    const isLiked = icon.classList.contains('fa-solid');

    // OPTIMISTIC UI UPDATE
    if (isLiked) {
        icon.classList.remove('fa-solid', 'text-red-500');
        icon.classList.add('fa-regular');
    } else {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid', 'text-red-500');
    }

    try {
        await apiPost(`/favorites/toggle`, {
            user_id: user.id,
            product_id: productId
        });

        if (window.showToast) {
            window.showToast("Favorit diperbarui!", "success");
        }

        // Jika sedang di halaman profil
        if (window.location.pathname === "/profile" && typeof window.loadFavoritesGlobal === 'function') {
            window.loadFavoritesGlobal();
        }

    } catch (error) {
        console.error("Gagal toggle wishlist:", error);

        // REVERT UI kalau gagal
        if (isLiked) {
            icon.classList.add('fa-solid', 'text-red-500');
            icon.classList.remove('fa-regular');
        } else {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-solid', 'text-red-500');
        }
    }
}

/* -----------------------------------------------------------
   4. SERVICE WORKER & NOTIFICATION (tidak butuh utils)
----------------------------------------------------------- */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('SW Registered:', registration.scope);

                if ('Notification' in window) {
                    if (Notification.permission === 'default') {
                        showNotificationPermissionPrompt();
                    }
                }
            } catch (error) {
                console.error('SW Registration failed:', error);
            }
        });
    }
}

export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert("Browser ini tidak mendukung notifikasi.");
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        if (window.showToast) window.showToast("Notifikasi diaktifkan!", "success");
    } else {
        if (window.showToast) window.showToast("Notifikasi ditolak.", "error");
    }
}

function showNotificationPermissionPrompt() {
    const div = document.createElement('div');
    div.className = "fixed bottom-24 left-4 z-[60] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-blue-100 dark:border-gray-700 flex flex-col gap-2 animate-bounce-slow max-w-xs md:bottom-8";

    div.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="p-2 bg-blue-100 text-blue-600 rounded-full">
                <i class="fa-solid fa-bell"></i>
            </div>
            <div>
                <h4 class="font-bold text-sm text-gray-800 dark:text-white">Aktifkan Notifikasi?</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Dapatkan info promo dan transaksi terbaru.</p>
            </div>
        </div>
        <div class="flex gap-2 mt-2 justify-end">
            <button id="btn-allow-notif" class="btn btn-xs btn-primary text-white">Izinkan</button>
            <button id="btn-close-notif" class="btn btn-xs btn-ghost text-gray-400">Nanti</button>
        </div>
    `;

    document.body.appendChild(div);

    div.querySelector('#btn-allow-notif').addEventListener('click', () => {
        requestNotificationPermission();
        div.remove();
    });

    div.querySelector('#btn-close-notif').addEventListener('click', () => div.remove());
}
