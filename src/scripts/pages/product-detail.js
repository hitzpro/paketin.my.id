// src/scripts/pages/product-detail.js
import { apiPost } from '../utils/api.js';

export function initProductDetail() {
    const btnBuy = document.getElementById('btn-buy-now');
    
    // Modal Elements
    const modal = document.getElementById('confirm_buy_modal');
    const btnConfirm = document.getElementById('confirm_buy_modal-confirm-btn'); // ID ini dari Modal.astro (biasanya id_modal + -confirm-btn)
    const btnCancel = document.getElementById('confirm_buy_modal-cancel-btn');

    if (!btnBuy) return;

    // 1. EVENT KLIK "BAYAR SEKARANG"
    // Clone node untuk hapus listener lama (SPA safe)
    const newBtnBuy = btnBuy.cloneNode(true);
    btnBuy.parentNode.replaceChild(newBtnBuy, btnBuy);

    newBtnBuy.addEventListener('click', () => {
        const userStr = localStorage.getItem('paketin_user');
        
        // Cek Login
        if (!userStr) {
            if(confirm("Silakan login terlebih dahulu untuk membeli paket.")) {
                window.location.href = '/auth/login';
            }
            return;
        }

        // Buka Modal
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex'); // Pastikan display flex
        }
    });

    // 2. EVENT KLIK "YA, BELI" (Di dalam Modal)
    if (btnConfirm) {
        const newBtnConfirm = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

        newBtnConfirm.addEventListener('click', async () => {
            const userStr = localStorage.getItem('paketin_user');
            if(!userStr) return;
            
            const user = JSON.parse(userStr);
            const productId = newBtnBuy.getAttribute('data-product-id');

            // UI Loading
            const originalText = newBtnBuy.innerText;
            newBtnBuy.innerHTML = '<span class="loading loading-spinner"></span> Memproses...';
            newBtnBuy.disabled = true;
            
            // Tutup Modal biar gak ganggu
            if(modal) modal.classList.add('hidden');

            // Panggil API Checkout
            const res = await apiPost('/checkout/create', {
                user_id: user.id,
                product_id: productId,
                quantity: 1
            });

            if (res.ok) {
                if (typeof window.showToast === 'function') window.showToast('Tagihan dibuat!', 'success');
                
                // Redirect ke Payment Page
                setTimeout(() => {
                    window.location.href = `/payment/${res.data.checkout_id}`;
                }, 500);
            } else {
                // Error Handler
                if (typeof window.showToast === 'function') window.showToast(res.error || 'Gagal checkout', 'error');
                else alert(res.error);

                // Reset Tombol
                newBtnBuy.innerHTML = originalText;
                newBtnBuy.disabled = false;
            }
        });
    }

    // 3. EVENT KLIK "BATAL" (Tutup Modal)
    if (btnCancel && modal) {
        const newBtnCancel = btnCancel.cloneNode(true);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
        
        newBtnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }

    initFavoriteButton();
}


// Logic Tombol Favorit Detail (BARU)
function initFavoriteButton() {
    const btnFav = document.getElementById('btn-favorite-detail');
    
    if (!btnFav) return;

    // Clone agar event listener fresh
    const newBtnFav = btnFav.cloneNode(true);
    btnFav.parentNode.replaceChild(newBtnFav, btnFav);

    newBtnFav.addEventListener('click', async () => {
        const userStr = localStorage.getItem('paketin_user');
        if (!userStr) {
            if(confirm("Silakan login untuk menyimpan favorit.")) {
                window.location.href = '/auth/login';
            }
            return;
        }

        const user = JSON.parse(userStr);
        const productId = newBtnFav.getAttribute('data-product-id');
        const icon = newBtnFav.querySelector('i');

        // Optimistic UI Update (Biar responsif)
        const isLiked = icon.classList.contains('text-red-500');
        if (isLiked) {
            icon.classList.remove('text-red-500', 'fa-solid');
            icon.classList.add('text-gray-400', 'fa-regular');
        } else {
            icon.classList.add('text-red-500', 'fa-solid');
            icon.classList.remove('text-gray-400', 'fa-regular');
        }

        try {
            // Call API
            const res = await apiPost('/favorites/toggle', {
                user_id: user.id,
                product_id: productId
            });

            if (res.ok) {
                if (typeof window.showToast === 'function') window.showToast(res.data.message, 'success');
            } else {
                // Revert UI kalau gagal
                if (typeof window.showToast === 'function') window.showToast('Gagal update favorit', 'error');
                // Balikin icon
                if (isLiked) {
                    icon.classList.add('text-red-500', 'fa-solid');
                    icon.classList.remove('text-gray-400', 'fa-regular');
                } else {
                    icon.classList.remove('text-red-500', 'fa-solid');
                    icon.classList.add('text-gray-400', 'fa-regular');
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
}