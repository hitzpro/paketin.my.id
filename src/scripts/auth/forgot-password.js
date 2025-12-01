// src/scripts/auth/forgot-password.js
import { apiPost } from '../../scripts/utils/api.js';

export function initForgotPassword() {
    const formRequest = document.getElementById('form-request-otp');
    const formReset = document.getElementById('form-reset-password');
    
    const emailInput = document.getElementById('forgot-email');
    const btnRequest = document.getElementById('btn-request');
    
    const otpInput = document.getElementById('forgot-otp');
    const passInput = document.getElementById('new-password');
    const btnReset = document.getElementById('btn-reset');
    const btnBack = document.getElementById('btn-back');
    const infoText = document.getElementById('email-sent-info');

    // State sementara untuk menyimpan email
    let currentEmail = "";

    function safeToast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type);
        else alert(msg);
    }

    // STEP 1: REQUEST OTP
    if (formRequest) {
        // Clone Node
        const newFormRequest = formRequest.cloneNode(true);
        formRequest.parentNode.replaceChild(newFormRequest, formRequest);

        // Re-query elemen di dalam form baru (penting saat clone)
        const currentEmailInput = document.getElementById('forgot-email');
        const currentBtnRequest = document.getElementById('btn-request');

        newFormRequest.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailVal = currentEmailInput.value;
            currentBtnRequest.disabled = true;
            currentBtnRequest.innerText = "Mengirim...";

            const res = await apiPost('/forgot-password/request', { email: emailVal });

            if (res.ok) {
                currentEmail = emailVal;
                safeToast("Kode OTP terkirim ke email Anda", "success");
                
                // Update info text
                if(document.getElementById('email-sent-info')) {
                    document.getElementById('email-sent-info').innerText = `Kode OTP telah dikirim ke ${currentEmail}`;
                }

                // Switch Form UI
                document.getElementById('form-request-otp').classList.add('hidden');
                document.getElementById('form-reset-password').classList.remove('hidden');
                document.getElementById('form-reset-password').classList.add('flex');
            } else {
                safeToast(res.error || "Email tidak ditemukan", "error");
                currentBtnRequest.disabled = false;
                currentBtnRequest.innerText = "Kirim Kode OTP";
            }
        });
    }

    // STEP 2: RESET PASSWORD
    if (formReset) {
        const newFormReset = formReset.cloneNode(true);
        formReset.parentNode.replaceChild(newFormReset, formReset);

        // Re-query elemen
        const currentOtpInput = document.getElementById('forgot-otp');
        const currentPassInput = document.getElementById('new-password');
        const currentBtnReset = document.getElementById('btn-reset');

        newFormReset.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const otpVal = currentOtpInput.value;
            const passVal = currentPassInput.value;

            currentBtnReset.disabled = true;
            currentBtnReset.innerText = "Memproses...";

            const res = await apiPost('/forgot-password/reset', { 
                email: currentEmail,
                otp: otpVal,
                new_password: passVal
            });

            if (res.ok) {
                // Tampilkan Modal Sukses Global
                if (typeof window['openModal_success_reset_modal'] === 'function') {
                     // Override tombol modal agar redirect ke login
                     const modalConfirmBtn = document.getElementById('success_reset_modal-confirm-btn');
                     if(modalConfirmBtn) {
                        const newBtn = modalConfirmBtn.cloneNode(true);
                        modalConfirmBtn.parentNode.replaceChild(newBtn, modalConfirmBtn);
                        
                        newBtn.innerText = "Login Sekarang";
                        newBtn.className = "btn btn-primary text-white w-full"; // Styling
                        newBtn.addEventListener('click', () => {
                            window.location.href = '/auth/login';
                        });
                     }
                     window['openModal_success_reset_modal']();
                } else {
                    // Fallback
                    safeToast("Password Berhasil Diubah!", "success");
                    setTimeout(() => window.location.href = '/auth/login', 1500);
                }

            } else {
                safeToast(res.error || "Gagal reset password", "error");
                currentBtnReset.disabled = false;
                currentBtnReset.innerText = "Ubah Password";
            }
        });
        
        // Tombol Kembali
        const currentBtnBack = document.getElementById('btn-back');
        if (currentBtnBack) {
            // Clone lagi untuk back button
            const newBackBtn = currentBtnBack.cloneNode(true);
            currentBtnBack.parentNode.replaceChild(newBackBtn, currentBtnBack);
            
            newBackBtn.addEventListener('click', () => {
                document.getElementById('form-reset-password').classList.add('hidden');
                document.getElementById('form-reset-password').classList.remove('flex');
                document.getElementById('form-request-otp').classList.remove('hidden');
                
                // Reset button state step 1
                const btnReq = document.getElementById('btn-request');
                if(btnReq) {
                    btnReq.disabled = false;
                    btnReq.innerText = "Kirim Kode OTP";
                }
            });
        }
    }
}