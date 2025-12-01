// src/scripts/pages/payment.js
import { apiGet, apiPost } from '../../scripts/utils/api.js';

export function initPaymentPage(checkoutId) {
    const activeArea = document.getElementById('payment-active');
    const headerArea = document.getElementById('payment-header');
    const successArea = document.getElementById('state-success');
    const failedArea = document.getElementById('state-failed');
    const btnSimulate = document.getElementById('btn-simulate-scan');
    const timerDisplay = document.getElementById('timer-display'); 

    let pollingInterval;
    let timerInterval;

    // Helper Toast
    function safeToast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type);
        else console.log(`[${type}] ${msg}`);
    }

    // 1. Fungsi Stop
    function stopAll() {
        if(pollingInterval) clearInterval(pollingInterval);
        if(timerInterval) clearInterval(timerInterval);
        localStorage.removeItem('pending_transaction');
    }

    // 2. Handle Success
    function showSuccess() {
        stopAll();
        if(activeArea) activeArea.classList.add('hidden');
        if(headerArea) headerArea.classList.add('hidden');
        if(successArea) {
            successArea.classList.remove('hidden');
            successArea.classList.add('flex');
        }
        safeToast('Pembayaran Berhasil!', 'success');
    }

    // 3. Handle Failed
    function showFailed() {
        stopAll();
        if(activeArea) activeArea.classList.add('hidden');
        if(headerArea) headerArea.classList.add('hidden');
        if(failedArea) {
            failedArea.classList.remove('hidden');
            failedArea.classList.add('flex');
        }
        safeToast('Waktu pembayaran habis', 'error');
    }

    // 4. Timer Logic
    const duration = 5 * 60; // 5 menit
    const now = Date.now();
    let expiryTime = now + (duration * 1000);
    
    // Sync dengan LocalStorage agar timer tidak reset saat refresh
    const existingPending = localStorage.getItem('pending_transaction');
    if (existingPending) {
        try {
            const data = JSON.parse(existingPending);
            if (data.id == checkoutId) {
                expiryTime = data.expiry;
            } else {
                localStorage.setItem('pending_transaction', JSON.stringify({ id: checkoutId, expiry: expiryTime }));
            }
        } catch (e) {
            localStorage.setItem('pending_transaction', JSON.stringify({ id: checkoutId, expiry: expiryTime }));
        }
    } else {
        localStorage.setItem('pending_transaction', JSON.stringify({ id: checkoutId, expiry: expiryTime }));
    }
    
    const secondsRemaining = Math.floor((expiryTime - Date.now()) / 1000);

    if (secondsRemaining <= 0) {
        showFailed();
    }

    // FUNGSI UPDATE TIMER LANGSUNG DI SINI
    function updateTimer() {
        const now = Date.now();
        const secondsRemaining = Math.floor((expiryTime - now) / 1000);

        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            if (timerDisplay) timerDisplay.innerText = "00:00";
            showFailed();
        } else {
            const m = Math.floor(secondsRemaining / 60);
            const s = secondsRemaining % 60;
            if (timerDisplay) {
                timerDisplay.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
            }
        }
    }

    // Jalankan sekali di awal biar gak nunggu 1 detik
    updateTimer();
    
    // Loop setiap detik
    timerInterval = setInterval(updateTimer, 1000);

    // 5. Polling Status (Setiap 3 detik)
    pollingInterval = setInterval(async () => {
        try {
            // Pake wrapper apiGet
            const res = await apiGet(`/payment/status/${checkoutId}`);
            
            if (res.ok) {
                if (res.data.is_paid) {
                    showSuccess();
                }
            } else {
                // Jika 404 atau error lain, mungkin transaksi batal/hapus
                if (res.status === 404) showFailed();
            }
        } catch (err) {
            console.error("Polling error", err);
        }
    }, 3000);

    // 6. Simulasi Bayar (Dev Only)
    if (btnSimulate) {
        // Clone node agar event listener bersih
        const newBtn = btnSimulate.cloneNode(true);
        btnSimulate.parentNode.replaceChild(newBtn, btnSimulate);

        newBtn.addEventListener('click', async () => {
            newBtn.innerHTML = '<span class="loading loading-spinner"></span> Scanning...';
            try {
                // Pake wrapper apiPost
                await apiPost('/payment/pay', { checkout_id: checkoutId });
                // Tidak perlu panggil showSuccess(), polling yang akan menangkapnya
            } catch (e) {
                console.error(e);
                safeToast('Gagal simulasi bayar', 'error');
            }
        });
    }
}