// src/scripts/ui/bottom-nav.js
import { API_BASE_URL } from '../../config'; // Jika butuh API URL nanti (sekarang belum dipakai langsung di sini tapi bagus disiapkan)

export function initBottomNav() {
    updateBottomNav();
    initFabSettings();
}

function updateBottomNav() {
    const authLink = document.getElementById('nav-auth-link');
    const authIcon = document.getElementById('nav-auth-icon');
    const authText = document.getElementById('nav-auth-text');
    const userStr = localStorage.getItem('paketin_user');

    if (!authLink || !authIcon || !authText) return;

    const baseClasses = ['fa-solid', 'text-xl', 'mb-1', 'transition-all', 'duration-200'];
    const inactiveColor = ['text-gray-400', 'dark:text-gray-500'];
    const activeColor = ['text-blue-600', 'dark:text-blue-400'];

    // Reset classes
    authIcon.className = '';

    if (userStr) {
        // STATE: LOGIN
        authLink.setAttribute('href', '/profile');
        authIcon.classList.add(...baseClasses, 'fa-user');
        
        if(window.location.pathname === '/profile') {
            authIcon.classList.add(...activeColor);
        } else {
            authIcon.classList.add(...inactiveColor);
        }
        authText.innerText = "Akun";
    } else {
        // STATE: BELUM LOGIN
        authLink.setAttribute('href', '/auth/login');
        authIcon.classList.add(...baseClasses, 'fa-right-to-bracket');
        
        if(window.location.pathname === '/auth/login') {
            authIcon.classList.add(...activeColor);
        } else {
            authIcon.classList.add(...inactiveColor);
        }
        authText.innerText = "Masuk";
    }
}

function initFabSettings() {
    const fabBtn = document.getElementById('fab-trigger');
    const fabMenu = document.getElementById('fab-menu');
    const html = document.documentElement;
    const body = document.body;

    if (!fabBtn || !fabMenu) return;

    // Toggle Menu
    const toggleMenu = (e) => {
        e.stopPropagation(); 
        const isOpen = !fabMenu.classList.contains('opacity-0');

        if (isOpen) {
            // Close
            fabMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-90');
            fabMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
            fabBtn.classList.remove('opacity-100', 'scale-110');
            fabBtn.classList.add('opacity-50');
        } else {
            // Open
            fabMenu.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-90');
            fabMenu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
            fabBtn.classList.remove('opacity-50'); 
            fabBtn.classList.add('opacity-100', 'scale-110');
        }
    };

    // Clone button agar listener fresh di SPA
    const newFabBtn = fabBtn.cloneNode(true);
    fabBtn.parentNode.replaceChild(newFabBtn, fabBtn);
    newFabBtn.addEventListener('click', toggleMenu);

    // Klik di luar menu = Close Menu
    document.addEventListener('click', (e) => {
        if (!newFabBtn.contains(e.target) && !fabMenu.contains(e.target)) {
            fabMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4', 'scale-90');
            fabMenu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0', 'scale-100');
            newFabBtn.classList.remove('opacity-100', 'scale-110');
            newFabBtn.classList.add('opacity-50');
        }
    });

    // --- Logic Dark Mode di FAB ---
    const toggle = document.getElementById('fab-toggle-darkmode');
    if (toggle) {
        toggle.checked = html.classList.contains('dark');
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            if (isDark) {
                html.classList.add('dark');
                html.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
            
            // Sinkronkan toggle lain (Navbar/Profile)
            const otherToggles = document.querySelectorAll('#nav-toggle-darkmode, #toggle-darkmode');
            otherToggles.forEach(t => t.checked = isDark);
        });
    }

    // --- Logic Font Size di FAB ---
    const fontBtns = document.querySelectorAll('.fab-font-btn');
    fontBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            const size = newBtn.dataset.size;
            body.classList.remove('text-sm', 'text-base', 'text-lg');
            if (size === 'small') body.classList.add('text-sm');
            else if (size === 'large') body.classList.add('text-lg');
            else body.classList.add('text-base');
            localStorage.setItem('fontSize', size);
        });
    });
}