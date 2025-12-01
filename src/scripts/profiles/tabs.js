// src/scripts/profile/tabs.js
import { API_BASE_URL } from '../../config';

// Function Logout yang MANDIRI
async function performLogout() {
    try {
        // 1. Panggil API
        const userLocal = JSON.parse(localStorage.getItem('paketin_user') || '{}');
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include', // PENTING!
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userLocal.id })
        });
    } catch (e) { 
        console.error("Logout API error:", e); 
    }

    // 2. Hapus Data Lokal (Client Side Cleanup)
    document.cookie = "user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem('paketin_user');
    
    // 3. Redirect
    if (typeof window.showToast === 'function') window.showToast('Berhasil keluar.', 'success');
    
    setTimeout(() => { 
        window.location.href = '/auth/login'; 
    }, 500);
}

export function initProfileTabs() {
    const tabs = document.querySelectorAll('[data-tabs-target]');
    const tabContents = document.querySelectorAll('[role="tabpanel"]');
    const btnLogout = document.getElementById('tab-logout');

    const activeClasses = ['text-blue-600', 'border-blue-600', 'active-tab'];
    const inactiveClasses = ['border-transparent', 'hover:text-gray-600', 'hover:border-gray-300', 'inactive-tab'];

    // 1. Logic Pindah Tab
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSelector = tab.getAttribute('data-tabs-target');
            if (!targetSelector) return;
            const targetContent = document.querySelector(targetSelector);

            tabContents.forEach(content => content.classList.add('hidden'));
            tabs.forEach(t => {
                t.classList.remove(...activeClasses);
                t.classList.add(...inactiveClasses);
            });

            tab.classList.remove(...inactiveClasses);
            tab.classList.add(...activeClasses);
            if (targetContent) targetContent.classList.remove('hidden');
        });
    });

    // 2. Logic Tombol KELUAR (Logout)
    if (btnLogout) {
        // Clone node untuk membersihkan event listener lama
        const newBtnLogout = btnLogout.cloneNode(true);
        btnLogout.parentNode.replaceChild(newBtnLogout, btnLogout);

        newBtnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Coba panggil Modal Navbar dulu (Global Modal)
            // Pastikan modal di navbar mengekspos fungsinya ke window
            if (typeof window['openModal_logout_modal'] === 'function') {
                window['openModal_logout_modal']();
            } else {
                // FALLBACK: Confirm biasa -> Panggil fungsi logout lokal
                if(confirm("Apakah Anda yakin ingin keluar akun?")) {
                    performLogout();
                }
            }
        });
    }
}