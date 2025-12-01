// src/scripts/ui/navbar.js

import { apiPost } from '../../scripts/utils/api.js';

export function initNavbar() {
    renderNavbarAuth();
    initNavbarSettings();
    globalLogoutListener();   // <-- FIX PENTING
    setupLogoutModal();
}

/* -----------------------------------------------------------
   1. AUTH SECTION (menampilkan profil atau tombol login)
----------------------------------------------------------- */
function renderNavbarAuth() {
    const authSection = document.getElementById('navbar-auth-section');
    if (!authSection) return;

    const userStr = localStorage.getItem('paketin_user');

    if (userStr) {
        const user = JSON.parse(userStr);
        const userName = user.name || 'User';

        const profilePic = user.profile_picture
            ? `<img src="${user.profile_picture}" class="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-600">`
            : `<i class="fa-solid fa-user-circle text-blue-600 dark:text-blue-400 text-2xl"></i>`;

        authSection.innerHTML = `
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full cursor-pointer border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    ${profilePic}
                    <span class="font-semibold text-sm text-gray-700 dark:text-gray-200 max-w-[100px] truncate">${userName}</span>
                    <i class="fa-solid fa-chevron-down text-xs text-gray-400"></i>
                </div>

                <ul tabindex="0" class="dropdown-content menu p-2 shadow-xl bg-white dark:bg-gray-800 rounded-2xl w-56 mt-4 border border-gray-100 dark:border-gray-700">
                    <li class="menu-title px-4 py-2 text-xs font-bold text-gray-400 uppercase">Akun Saya</li>
                    <li><a href="/profile"><i class="fa-solid fa-user w-5"></i>Profil</a></li>

                    <div class="divider my-1 border-gray-200 dark:border-gray-700"></div>

                    <li>
                        <button id="btn-trigger-logout" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <i class="fa-solid fa-right-from-bracket w-5"></i>Keluar
                        </button>
                    </li>
                </ul>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <a href="/auth/login" class="btn btn-sm bg-blue-600 border-none text-white hover:bg-blue-700 px-6 rounded-full font-bold shadow-md">
                Masuk
            </a>
        `;
    }
}

/* -----------------------------------------------------------
   2. DARK MODE & FONT SIZE
----------------------------------------------------------- */
function initNavbarSettings() {
    const html = document.documentElement;
    const body = document.body;

    // DARK MODE
    const toggle = document.getElementById('nav-toggle-darkmode');
    if (toggle) {
        toggle.checked = html.classList.contains('dark') || localStorage.getItem('theme') === 'dark';

        toggle.addEventListener('change', (e) => {
            const dark = e.target.checked;

            html.classList.toggle('dark', dark);
            html.setAttribute('data-theme', dark ? 'dark' : 'light');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        });
    }

    // FONT SIZE
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".nav-font-btn");
        if (!btn) return;

        const size = btn.dataset.size;
        body.classList.remove('text-sm', 'text-base', 'text-lg');

        if (size === 'small') body.classList.add('text-sm');
        else if (size === 'large') body.classList.add('text-lg');
        else body.classList.add('text-base');

        localStorage.setItem('fontSize', size);
    });
}

/* -----------------------------------------------------------
   3. LOGOUT (GLOBAL EVENT DELEGATION) — FIX UTAMA
----------------------------------------------------------- */
function globalLogoutListener() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#btn-trigger-logout");
        if (!btn) return;

        e.preventDefault();
        if (typeof window.openModal_logout_modal === "function") {
            window.openModal_logout_modal();
        }
    });
}

/* -----------------------------------------------------------
   4. KONFIRMASI LOGOUT MODAL
----------------------------------------------------------- */
function setupLogoutModal() {
    const btn = document.getElementById('logout_modal-confirm-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const userLocal = JSON.parse(localStorage.getItem('paketin_user') || '{}');

        btn.innerText = "Keluar...";

        await apiPost("/logout", { user_id: userLocal.id });

        localStorage.removeItem("paketin_user");
        document.cookie = "user_id=; Path=/; Expires=Thu, 01 Jan 1970;";

        if (window.showToast) window.showToast("Berhasil keluar.", "success");

        setTimeout(() => (window.location.href = "/auth/login"), 400);
    });
}

