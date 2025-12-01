// src/scripts/core/theme.js

export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const htmlEl = document.documentElement;

    // LOGIC: Jika 'dark' -> Dark. Selain itu (termasuk null) -> Light.
    if (savedTheme === 'dark') {
        htmlEl.classList.add('dark');
        htmlEl.setAttribute('data-theme', 'dark');
    } else {
        htmlEl.classList.remove('dark');
        htmlEl.setAttribute('data-theme', 'light');
    }

    // Logic Font Size (Optional, jika ingin dipersistensikan di sini juga)
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
        const body = document.body;
        body.classList.remove('text-sm', 'text-base', 'text-lg');
        
        if (savedSize === 'small') body.classList.add('text-sm');
        else if (savedSize === 'large') body.classList.add('text-lg');
        else body.classList.add('text-base');
    }
}