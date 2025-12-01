// src/scripts/pages/home.js
import { initRecommendationSection } from '../features/recommendation.js';

export function initHomePage() {
    updateHomeUI();
    initRecommendationSection(); // Panggil logic rekomendasi
}

function updateHomeUI() {
    const usernameEl = document.getElementById('home-username');
    const authBtn = document.getElementById('home-auth-btn');
    const authIcon = document.getElementById('home-auth-icon');
    const userStr = localStorage.getItem('paketin_user');

    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (usernameEl) usernameEl.innerText = user.name || "Pelanggan Setia";
            if (authBtn && authIcon) {
                authBtn.setAttribute('href', '/notifikasi');
                authIcon.className = 'fa-regular fa-bell text-lg';
                authBtn.setAttribute('aria-label', 'Notifikasi');
            }
        } catch (e) { console.error(e); }
    } else {
        if (usernameEl) usernameEl.innerText = "Guest User";
        if (authBtn && authIcon) {
            authBtn.setAttribute('href', '/auth/login');
            authIcon.className = 'fa-solid fa-right-to-bracket text-lg';
            authBtn.setAttribute('aria-label', 'Masuk Akun');
        }
    }
}