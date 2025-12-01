import { apiPost } from '../../scripts/utils/api.js';

export function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const btnSubmit = document.getElementById('btn-login-submit');
    const btnLoading = document.getElementById('btn-login-loading');

    const toggleBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const passwordInput = document.getElementById('login-password');

    // ============================================================
    // TOGGLE PASSWORD — TANPA CLONE
    // ============================================================
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = passwordInput.getAttribute('type') === 'password';

            passwordInput.setAttribute('type', isHidden ? 'text' : 'password');

            if (eyeIcon) {
                eyeIcon.className = isHidden
                    ? 'fa-solid fa-eye-slash'
                    : 'fa-solid fa-eye';
            }
        });
    }

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
    // FORM SUBMIT — TANPA CLONE
    // ============================================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("🚀 Tombol Login Diklik!");

        const phoneInput = document.getElementById('login-identity');
        const passInput = document.getElementById('login-password');

        if (!phoneInput || !passInput) return;

        setButtonLoading(true);

        const response = await apiPost('/login', {
            phone_number: phoneInput.value,
            password: passInput.value
        });

        if (response.ok) {
            safeToast('Login berhasil!', 'success');

            localStorage.setItem(
                'paketin_user',
                JSON.stringify(response.data.user)
            );

            if (response.data.needs_onboarding) {
                window.location.href = '/auth/onBoarding';
            } else {
                window.location.href = '/';
            }
        } else {
            safeToast(response.error || 'Login gagal.', 'error');
            setButtonLoading(false);
        }
    });
}
