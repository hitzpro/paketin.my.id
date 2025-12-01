import { apiPost } from '../../scripts/utils/api.js';

export function initRegisterForm() {
    const regForm = document.getElementById('register-form');
    if (!regForm) return;

    const btnRegSubmit = document.getElementById('btn-reg-submit');
    const btnRegLoading = document.getElementById('btn-reg-loading');

    const nameInput = document.getElementById('reg-name');
    const phoneInput = document.getElementById('reg-phone');
    const emailInput = document.getElementById('reg-email');
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm-password');

    // ============================================================
    // HELPER TOAST
    // ============================================================
    function safeToast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type);
        else alert(msg);
    }

    // ============================================================
    // HELPER BUTTON LOADING
    // ============================================================
    function setButtonLoading(isLoading) {
        if (!btnRegSubmit || !btnRegLoading) return;

        if (isLoading) {
            btnRegSubmit.classList.add('hidden');
            btnRegLoading.classList.remove('hidden');
            btnRegLoading.classList.add('flex');
        } else {
            btnRegSubmit.classList.remove('hidden');
            btnRegLoading.classList.add('hidden');
            btnRegLoading.classList.remove('flex');
        }
    }

    // ============================================================
    // SUBMIT FORM — TANPA CLONE NODE
    // ============================================================
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!passInput || !confirmInput) return;

        // Cek konfirmasi password
        if (passInput.value !== confirmInput.value) {
            safeToast('Konfirmasi password tidak cocok!', 'warning');
            return;
        }

        setButtonLoading(true);

        // API Request
        const response = await apiPost('/register', {
            name: nameInput?.value,
            phone_number: phoneInput?.value,
            email: emailInput?.value,
            password: passInput?.value
        });

        if (response.ok) {
            safeToast('Registrasi berhasil! Silakan verifikasi OTP.', 'success');

            sessionStorage.setItem(
                'pending_auth',
                JSON.stringify({
                    user_id: response.data.user_id,
                    phone_number: phoneInput.value
                })
            );

            setTimeout(() => {
                window.location.href = '/auth/otp';
            }, 800);

        } else {
            safeToast(response.error || 'Gagal mendaftar', 'error');
            setButtonLoading(false);
        }
    });

    // ============================================================
    // TOGGLE PASSWORDS — TANPA CLONE NODE
    // ============================================================
    setupToggle('toggle-reg-password', 'reg-password', 'eye-icon-pass');
    setupToggle('toggle-reg-confirm', 'reg-confirm-password', 'eye-icon-confirm');
}


// ============================================================
// GLOBAL HELPER: TOGGLE PASSWORD
// ============================================================
function setupToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!btn || !input || !icon) return;

    btn.addEventListener('click', () => {
        const isHidden = input.getAttribute('type') === 'password';
        input.setAttribute('type', isHidden ? 'text' : 'password');

        icon.className = isHidden
            ? 'fa-solid fa-eye-slash'
            : 'fa-solid fa-eye';
    });
}
