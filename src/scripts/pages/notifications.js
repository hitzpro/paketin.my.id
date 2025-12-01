import { apiGet, apiPut, apiDelete } from '../../scripts/utils/api.js';

let currentPage = 1;
let allNotifications = [];
let hasNext = false;
let notificationIdToDelete = null; // Variabel global modul untuk simpan ID

// Init function (dipanggil dari Astro script)
export function initNotificationPage() {
    fetchNotifications(1);
    setupEventListeners();
    setupDeleteModal();
    
    // PENTING: Expose fungsi ke window agar bisa dipanggil dari onclick HTML string
    window.toggleNotif = toggleNotif;
    window.openDeleteModal = openDeleteModal; 
}

// --- SETUP MODAL LISTENER ---
function setupDeleteModal() {
    const modal = document.getElementById('delete_notif_modal');
    
    // Perhatikan ID tombol di Modal.astro Anda. 
    // Biasanya formatnya: {id_modal}-confirm-btn
    const btnConfirm = document.getElementById('delete_notif_modal-confirm-btn');
    const btnCancel = document.getElementById('delete_notif_modal-cancel-btn'); 

    if (btnConfirm) {
        // Clone node untuk membersihkan listener lama (penting di SPA)
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

        // Styling tombol konfirmasi (Merah)
        newBtn.innerText = "Hapus";
        newBtn.className = "btn btn-error text-white"; // Sesuaikan dengan class CSS Anda

        newBtn.addEventListener('click', async () => {
            if (notificationIdToDelete) {
                // Sembunyikan Modal dulu
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
                
                // Jalankan Proses Hapus
                await executeDelete(notificationIdToDelete);
                notificationIdToDelete = null; // Reset
            }
        });
    }
    
    // Setup Cancel Button (Optional jika modal bawaan sudah handle)
    if (btnCancel && modal) {
         const newCancel = btnCancel.cloneNode(true);
         btnCancel.parentNode.replaceChild(newCancel, btnCancel);
         newCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            notificationIdToDelete = null;
         });
    }
}

// --- FUNGSI GLOBAL (Dipanggil via onclick HTML) ---

function openDeleteModal(id) {
    notificationIdToDelete = id; // Simpan ID ke variabel global modul
    
    const modal = document.getElementById('delete_notif_modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Pastikan flex agar centering jalan
    } else {
        console.error("Modal element not found!");
    }
}

async function toggleNotif(id) {
    const content = document.getElementById(`content-${id}`);
    const chevron = document.getElementById(`chevron-${id}`);
    const card = document.getElementById(`notif-${id}`);
    
    if (!content || !card) return;

    const isHidden = content.classList.contains('hidden');
    
    if (isHidden) {
        content.classList.remove('hidden');
        chevron?.classList.add('rotate-180');
        
        // Mark as Read Logic
        if (card.classList.contains('border-l-4')) {
            card.classList.remove('bg-white', 'dark:bg-gray-800', 'border-l-4', 'border-blue-500', 'shadow-sm');
            card.classList.add('opacity-70', 'bg-gray-50', 'dark:bg-gray-800/50');
            
            const notif = allNotifications.find(n => n.id === id);
            if(notif) notif.is_read = true;

            await apiPut(`/notifications/${id}/read`);
        }
    } else {
        content.classList.add('hidden');
        chevron?.classList.remove('rotate-180');
    }
}

// --- LOGIC INTERNAL ---

async function executeDelete(id) {
    const card = document.getElementById(`notif-${id}`);
    
    // Animasi hapus di UI
    if(card) {
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
    }
    
    // Tunggu animasi selesai (300ms)
    setTimeout(async () => {
        // Optimistic UI Update
        allNotifications = allNotifications.filter(n => n.id !== id);
        renderList();

        // API Call
        const res = await apiDelete(`/notifications/${id}`);
        
        if(res.ok) {
            if(typeof window.showToast === 'function') window.showToast('Notifikasi berhasil dihapus', 'success');
        } else {
            if(typeof window.showToast === 'function') window.showToast('Gagal menghapus notifikasi', 'error');
            // Kembalikan data jika gagal (refresh list)
            fetchNotifications(currentPage); 
        }
    }, 300);
}

// --- EVENT LISTENERS & FETCH ---

function setupEventListeners() {
    const loadMoreBtn = document.getElementById('btn-load-more');
    const refreshBtn = document.getElementById('refresh-btn');

    if(loadMoreBtn) {
        const newBtn = loadMoreBtn.cloneNode(true);
        loadMoreBtn.parentNode.replaceChild(newBtn, loadMoreBtn);
        
        newBtn.addEventListener('click', () => {
            currentPage++;
            fetchNotifications(currentPage);
        });
    }

    if(refreshBtn) {
        const newRefresh = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(newRefresh, refreshBtn);

        newRefresh.addEventListener('click', () => {
            const icon = newRefresh.querySelector('i');
            icon?.classList.add('fa-spin');
            currentPage = 1;
            fetchNotifications(1).then(() => {
                setTimeout(() => icon?.classList.remove('fa-spin'), 500);
            });
        });
    }
}

async function fetchNotifications(page = 1) {
    const userStr = localStorage.getItem('paketin_user');
    if(!userStr) { window.location.href = '/auth/login'; return; }
    const user = JSON.parse(userStr);

    const skeleton = document.getElementById('loading-skeleton');
    const container = document.getElementById('notification-container');
    const emptyState = document.getElementById('empty-state');

    if(page === 1 && skeleton && container) {
        skeleton.classList.remove('hidden');
        container.classList.add('hidden');
        emptyState?.classList.add('hidden');
    }

    const res = await apiGet(`/notifications/${user.id}?page=${page}`);

    if (res.ok) {
        const json = res.data;
        const newData = Array.isArray(json.data) ? json.data : [];

        if (page === 1) {
            allNotifications = newData;
        } else {
            allNotifications = [...allNotifications, ...newData];
        }
        
        hasNext = !!json.has_next;
        renderList();
    } else {
        console.error("Fetch Error:", res.error);
        if (page === 1) allNotifications = [];
        renderList();
    }
}

// --- HELPER & RENDER ---

function groupNotifications(notifs) {
    const groups = { today: [], thisWeek: [], older: [] };
    if (!Array.isArray(notifs)) return groups;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    notifs.forEach(n => {
        const date = new Date(n.created_at);
        if (date >= startOfToday) groups.today.push(n);
        else if (date >= sevenDaysAgo) groups.thisWeek.push(n);
        else groups.older.push(n);
    });

    return groups;
}

function getIconByType(type) {
    switch(type) {
        case 'success': return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', class: 'fa-solid fa-circle-check' };
        case 'warning': return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', class: 'fa-solid fa-triangle-exclamation' };
        case 'error': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', class: 'fa-solid fa-circle-xmark' };
        default: return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', class: 'fa-solid fa-bell' };
    }
}

function renderList() {
    const container = document.getElementById('notification-container');
    const emptyState = document.getElementById('empty-state');
    const loadMoreBtn = document.getElementById('btn-load-more');
    const skeleton = document.getElementById('loading-skeleton');

    if (!container || !emptyState || !skeleton) return;
    
    skeleton.classList.add('hidden'); 
    container.classList.remove('hidden');
    container.innerHTML = '';

    if (!Array.isArray(allNotifications) || allNotifications.length === 0) {
        emptyState.classList.remove('hidden');
        loadMoreBtn?.classList.add('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    const groups = groupNotifications(allNotifications);

    const renderSection = (title, items) => {
        if (!items || items.length === 0) return '';
        
        let html = `
            <div class="sticky top-[70px] z-20 py-2 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm mb-2">
                <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    ${title}
                </h3>
            </div>
            <div class="space-y-3 mb-6">`;
        
        items.forEach(item => {
            const isReadClass = item.is_read ? 'opacity-70 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800 border-l-4 border-blue-500 shadow-sm';
            const icon = getIconByType(item.type);
            const time = new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
            const dateFull = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            html += `
            <div class="relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group transition-all duration-300 ${isReadClass}" id="notif-${item.id}">
                <div class="p-4 cursor-pointer flex gap-4 items-start notif-trigger hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" onclick="toggleNotif(${item.id})">
                    <div class="flex-shrink-0 mt-0.5">
                        <div class="w-10 h-10 rounded-full ${icon.bg} flex items-center justify-center ${icon.text} shadow-sm">
                            <i class="${icon.class} text-lg"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight pr-2">${item.title}</h4>
                            <span class="text-[10px] font-medium text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">${time}</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">${item.message}</p>
                    </div>
                    <div class="flex-shrink-0 mt-1">
                        <i id="chevron-${item.id}" class="fa-solid fa-chevron-down text-gray-300 text-xs transition-transform duration-300"></i>
                    </div>
                </div>
                <div id="content-${item.id}" class="hidden px-4 pb-4 pl-[4.5rem] pt-0">
                    <div class="pt-2 border-t border-gray-100 dark:border-gray-700/50">
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${item.message}</p>
                        <div class="flex justify-between items-center mt-3 pt-2">
                            <span class="text-[10px] text-gray-400 flex items-center gap-1">
                                <i class="fa-regular fa-calendar"></i> ${dateFull} • ${time}
                            </span>
                            <button onclick="openDeleteModal(${item.id})" class="btn btn-xs btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded-md transition-colors">
                                <i class="fa-solid fa-trash mr-1"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        html += `</div>`;
        return html;
    };

    container.innerHTML += renderSection('Hari Ini', groups.today);
    container.innerHTML += renderSection('Minggu Ini', groups.thisWeek);
    container.innerHTML += renderSection('Lebih Lama', groups.older);

    if (loadMoreBtn) {
        hasNext ? loadMoreBtn.classList.remove('hidden') : loadMoreBtn.classList.add('hidden');
    }
}