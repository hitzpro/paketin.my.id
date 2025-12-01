// src/scripts/auth/onboarding.js
import { apiPost } from '../../scripts/utils/api.js';

export function initOnboardingForm() {
    const form = document.getElementById('onboarding-form');
    const skipBtn = document.getElementById('btn-skip');
    const btnSubmit = document.getElementById('btn-submit-survey');
    
    // 1. Ambil User ID
    const getUserId = () => {
        const match = document.cookie.match(new RegExp('(^| )user_id=([^;]+)'));
        if (match) return match[2];
        
        const userStr = localStorage.getItem('paketin_user');
        if (userStr) return JSON.parse(userStr).id;
        
        return null;
    };

    const userId = getUserId();

    // Redirect jika belum login
    if (!userId) {
        alert("Sesi habis, silakan login kembali.");
        window.location.href = '/auth/login';
        return;
    }

    // Helper Submit
    async function submitPreferences(dataPayload) {
        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
            btnSubmit.disabled = true;
        }

        // Gunakan apiPost wrapper
        const res = await apiPost('/user/update-profile-ml', {
            user_id: userId,
            ...dataPayload 
        });

        if (res.ok) {
            window.location.href = '/';
        } else {
            alert('Gagal: ' + (res.error || 'Server error'));
            if (btnSubmit) {
                btnSubmit.innerHTML = 'Simpan & Lanjutkan';
                btnSubmit.disabled = false;
            }
        }
    }

    // 2. Event Listener
    if (form) {
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(newForm);
            const usage = formData.getAll('usage'); 
            const budget = formData.get('budget');

            if(usage.length === 0 || !budget) {
                alert('Mohon pilih minimal satu kegunaan dan budget Anda.');
                return;
            }

            const payload = {
                survey_usage: usage,
                survey_budget: budget,
                source: 'survey'
            };

            submitPreferences(payload);
        });
    }

    if (skipBtn) {
        const newSkipBtn = skipBtn.cloneNode(true);
        skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
        
        newSkipBtn.addEventListener('click', () => {
            submitPreferences({ source: 'skip' });
        });
    }
}