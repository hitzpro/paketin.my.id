import { API_BASE_URL } from '../../config';

export function initOtpForm() {
    // ============================================================
    // 1. Ambil data pending_auth
    // ============================================================
    const pendingAuth = JSON.parse(sessionStorage.getItem('pending_auth') || 'null');
    if (!pendingAuth) {
        alert("Sesi tidak valid. Silakan daftar ulang.");
        window.location.href = '/auth/register';
        return;
    }

    // ============================================================
    // 2. Referensi Elemen
    // ============================================================
    const otpForm = document.getElementById('otp-form');
    const btnSubmit = document.getElementById('btn-otp-submit');
    const btnLoading = document.getElementById('btn-otp-loading');
    const btnConfirmCancel = document.getElementById('cancel-modal-confirm-btn');
    const countdownDisplay = document.getElementById('countdown');
    const btnResend = document.getElementById('resend-otp');
    const inputs = document.querySelectorAll('.otp-input');

    // ============================================================
    // Helper Toast dan Loading
    // ============================================================
    function safeToast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type);
        else alert(msg);
    }

    function setButtonLoading(isLoading) {
        if (!btnSubmit || !btnLoading) return;
        if (isLoading) {
            btnSubmit.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            btnLoading.classList.add('flex');
        } else {
            btnSubmit.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            btnLoading.classList.remove('flex');
        }
    }

    // ============================================================
    // 3. Logic Input OTP (auto focus)
    // ============================================================
    inputs.forEach((input, index) => {

        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Paste 6 digit OTP
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const digits = (e.clipboardData.getData('text') || "")
                .replace(/\D/g, '')
                .split('');

            digits.forEach((d, i) => {
                if (inputs[i]) inputs[i].value = d;
            });

            const last = Math.min(digits.length - 1, inputs.length - 1);
            inputs[last].focus();
        });
    });

    // ============================================================
    // 4. SUBMIT OTP
    // ============================================================
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let otpValue = '';
            inputs.forEach(i => otpValue += i.value);

            if (otpValue.length !== 6) {
                safeToast('Masukkan 6 digit OTP!', 'warning');
                return;
            }

            setButtonLoading(true);

            try {
                const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        phone_number: pendingAuth.phone_number,
                        otp: otpValue
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    safeToast('Verifikasi berhasil!', 'success');
                    sessionStorage.removeItem('pending_auth');
                    setTimeout(() => window.location.href = '/auth/login', 1000);
                } else {
                    safeToast(result.message || 'OTP salah', 'error');
                    setButtonLoading(false);
                }

            } catch (err) {
                console.error(err);
                safeToast('Kesalahan server', 'error');
                setButtonLoading(false);
            }
        });
    }

    // ============================================================
    // 5. CANCEL OTP
    // ============================================================
    if (btnConfirmCancel) {
        btnConfirmCancel.addEventListener('click', async () => {

            try {
                const response = await fetch(`${API_BASE_URL}/cancel-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: pendingAuth.user_id })
                });

                const result = await response.json();

                if (response.ok) {
                    safeToast('Registrasi dibatalkan.', 'info');
                    sessionStorage.removeItem('pending_auth');
                    window.location.href = '/auth/register';
                } else {
                    safeToast(result.message || 'Gagal membatalkan', 'error');
                }

            } catch (err) {
                console.error(err);
                safeToast('Gagal menghubungi server', 'error');
            }
        });
    }

    // ============================================================
    // 6. Countdown Timer (5 menit)
    // ============================================================
    let timeLeft = 300;

    if (window.otpTimerInterval) clearInterval(window.otpTimerInterval);

    window.otpTimerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(window.otpTimerInterval);
            if (countdownDisplay) countdownDisplay.innerText = "Kadaluarsa";
            if (btnResend) btnResend.disabled = false;
        } else {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            if (countdownDisplay) countdownDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            timeLeft--;
        }
    }, 1000);

    // ============================================================
    // 7. KIRIM ULANG OTP
    // ============================================================
    if (btnResend) {
        btnResend.addEventListener('click', async () => {

            if (timeLeft > 0) return;

            btnResend.disabled = true;
            btnResend.innerText = 'Mengirim...';

            try {
                const response = await fetch(`${API_BASE_URL}/resend-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone_number: pendingAuth.phone_number })
                });

                if (response.ok) {
                    safeToast('OTP baru dikirim', 'success');
                    window.location.reload(); // reset semua input + timer
                } else {
                    safeToast('Gagal mengirim OTP', 'error');
                    btnResend.disabled = false;
                    btnResend.innerText = 'Kirim Ulang OTP';
                }

            } catch (err) {
                console.error(err);
                safeToast('Error koneksi', 'error');
                btnResend.disabled = false;
                btnResend.innerText = 'Kirim Ulang OTP';
            }
        });
    }
}
