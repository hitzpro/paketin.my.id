// src/scripts/ui/toast.js

export function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    const template = document.getElementById('toast-template');
    
    if (!container || !template) return;

    const clone = template.content.cloneNode(true);
    const toastEl = clone.querySelector('div');
    const iconEl = clone.querySelector('.toast-icon');
    const iconBgEl = clone.querySelector('.toast-icon-bg');
    const msgEl = clone.querySelector('.toast-message');
    const closeBtn = clone.querySelector('.toast-close');

    msgEl.textContent = message;

    // --- LOGIKA WARNA KONSISTEN ---
    let iconClass = 'fa-circle-info';
    // Gunakan string array untuk class list agar aman
    let iconColor = ['text-blue-500', 'dark:text-blue-400'];
    let iconBg = ['bg-blue-100', 'dark:bg-blue-900/30'];
    let borderColor = []; 

    if (type === 'success') {
        iconClass = 'fa-circle-check';
        iconColor = ['text-green-500', 'dark:text-green-400'];
        iconBg = ['bg-green-100', 'dark:bg-green-900/30'];
        borderColor = ['border-green-200', 'dark:border-green-800'];
    } else if (type === 'error') {
        iconClass = 'fa-circle-exclamation';
        iconColor = ['text-red-500', 'dark:text-red-400'];
        iconBg = ['bg-red-100', 'dark:bg-red-900/30'];
        borderColor = ['border-red-200', 'dark:border-red-800'];
    } else if (type === 'warning') {
        iconClass = 'fa-triangle-exclamation';
        iconColor = ['text-orange-500', 'dark:text-orange-400'];
        iconBg = ['bg-orange-100', 'dark:bg-orange-900/30'];
        borderColor = ['border-orange-200', 'dark:border-orange-800'];
    }

    // Terapkan Border Khusus
    if(type !== 'default') {
        toastEl.classList.remove('border-gray-200', 'dark:border-gray-700');
        toastEl.classList.add(...borderColor);
    }
    
    // Terapkan Icon
    iconEl.className = `fa-solid text-lg toast-icon ${iconClass}`;
    iconEl.classList.add(...iconColor);

    // Terapkan Background Icon
    iconBgEl.className = "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg toast-icon-bg";
    iconBgEl.classList.add(...iconBg);

    // Close logic
    closeBtn.addEventListener('click', () => {
        toastEl.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toastEl.remove(), 300);
    });

    container.appendChild(toastEl);

    // Animasi Masuk
    requestAnimationFrame(() => {
        toastEl.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto close
    setTimeout(() => {
        if (document.body.contains(toastEl)) {
            toastEl.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toastEl.remove(), 300);
        }
    }, 4000);
}

// Expose ke Window agar script inline lama tetap jalan (Backwards Compatibility)
if (typeof window !== 'undefined') {
    window.showToast = showToast;
}