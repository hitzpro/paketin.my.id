// src/scripts/pages/pay-confirm.js
import { apiPost } from '../../utils/api.js';

export function initPayConfirm(checkoutId) {
    const btnPay = document.getElementById('btn-pay-confirm');
    
    if (!btnPay) return;

    btnPay.addEventListener('click', async () => {
        // 1. CEK LOGIN DI HP
        const userStr = localStorage.getItem('paketin_user');
        
        if (!userStr) {
            alert("Anda belum login di perangkat ini. Silakan login terlebih dahulu.");
            // Simpan URL return agar setelah login balik lagi ke sini (opsional)
            window.location.href = '/auth/login';
            return;
        }

        // 2. PROSES PEMBAYARAN
        const user = JSON.parse(userStr);
        const originalText = btnPay.innerHTML;
        
        btnPay.disabled = true;
        btnPay.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Memproses...';

        try {
            // Panggil API Pay
            // Di sini kita kirim user_id dari HP untuk validasi ownership (opsional di backend)
            // Tapi endpoint /payment/pay biasanya cuma butuh checkout_id
            const res = await apiPost('/payment/pay', { 
                checkout_id: checkoutId 
            });

            if (res.ok) {
                // 3. SUKSES
                document.getElementById('confirm-container').classList.add('hidden');
                document.getElementById('success-container').classList.remove('hidden');
                
                // Laptop (yang polling) akan otomatis update sendiri
            } else {
                alert('Gagal bayar: ' + (res.error || 'Error server'));
                btnPay.disabled = false;
                btnPay.innerHTML = originalText;
            }
        } catch (e) {
            console.error(e);
            alert('Gagal menghubungi server.');
            btnPay.disabled = false;
            btnPay.innerHTML = originalText;
        }
    });
}