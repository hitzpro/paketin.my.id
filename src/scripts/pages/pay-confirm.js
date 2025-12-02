// src/scripts/pages/pay-confirm.js
import { apiPost, apiGet } from '../../utils/api.js';

export function initPayConfirm(checkoutId) {
    const btnPay = document.getElementById('btn-pay-confirm');
    const confirmContainer = document.getElementById('confirm-container');
    const successContainer = document.getElementById('success-container');
    
    // Helper UI: Switch ke Sukses
    function showSuccessUI() {
        if(confirmContainer) confirmContainer.classList.add('hidden');
        if(successContainer) successContainer.classList.remove('hidden');
        if(btnPay) btnPay.classList.add('hidden'); // Sembunyikan tombol bayar
    }

    // 1. CEK STATUS AWAL SAAT LOAD
    // Berguna jika user reload halaman tapi sebenarnya sudah dibayar di perangkat lain
    async function checkStatusOnLoad() {
        try {
            const res = await apiGet(`/payment/status/${checkoutId}`);
            if (res.ok && res.data.is_paid) {
                showSuccessUI();
                return true; // Sudah dibayar
            }
        } catch (e) { console.error(e); }
        return false; // Belum dibayar
    }

    // Jalankan cek status saat halaman dibuka
    checkStatusOnLoad();

    if (!btnPay) return;

    // Clone node untuk membersihkan event listener lama
    const newBtnPay = btnPay.cloneNode(true);
    btnPay.parentNode.replaceChild(newBtnPay, btnPay);

    newBtnPay.addEventListener('click', async () => {
        // 2. CEK LOGIN DI HP
        const userStr = localStorage.getItem('paketin_user');
        
        if (!userStr) {
            if(confirm("Anda belum login di perangkat ini. Login sekarang untuk membayar?")) {
                // Simpan URL saat ini agar bisa balik lagi setelah login
                sessionStorage.setItem('redirect_after_login', window.location.pathname);
                window.location.href = '/auth/login';
            }
            return;
        }

        const user = JSON.parse(userStr);
        
        // Validasi sederhana: Apakah user yg login sama dengan pembuat transaksi? (Opsional)
        // Tapi untuk sekarang kita izinkan siapa saja bayar asal login.

        // 3. CEK STATUS LAGI SEBELUM BAYAR (Prevent Double Pay)
        // Siapa tau pas mau klik, eh di laptop udah kebayar duluan
        const alreadyPaid = await checkStatusOnLoad();
        if (alreadyPaid) {
            alert("Transaksi ini sudah dibayar sebelumnya!");
            return;
        }

        // 4. PROSES PEMBAYARAN
        const originalText = newBtnPay.innerHTML;
        newBtnPay.disabled = true;
        newBtnPay.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Memproses...';

        try {
            // Panggil API Pay
            const res = await apiPost('/payment/pay', { 
                checkout_id: checkoutId 
            });

            if (res.ok) {
                showSuccessUI();
                // Laptop (yang polling) akan otomatis update sendiri
            } else {
                alert('Gagal bayar: ' + (res.error || 'Error server'));
                newBtnPay.disabled = false;
                newBtnPay.innerHTML = originalText;
            }
        } catch (e) {
            console.error(e);
            alert('Gagal menghubungi server.');
            newBtnPay.disabled = false;
            newBtnPay.innerHTML = originalText;
        }
    });
}