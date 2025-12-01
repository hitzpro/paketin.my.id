// src/scripts/ui/accordion.js

export function initAccordion() {
    const toggles = document.querySelectorAll('.accordion-toggle');

    toggles.forEach(toggle => {
        // Clone untuk remove listener lama saat navigasi Astro
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);

        newToggle.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const item = btn.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            
            // Toggle Active Class
            const isActive = item.classList.contains('active');
            
            // Opsional: Tutup accordion lain (Accordion behavior)
            // document.querySelectorAll('.accordion-item').forEach(el => {
            //    el.classList.remove('active');
            //    el.querySelector('.accordion-content').classList.remove('max-h-96', 'opacity-100');
            //    el.querySelector('.accordion-content').classList.add('max-h-0', 'opacity-0');
            // });

            if (isActive) {
                item.classList.remove('active');
                content.classList.remove('max-h-96', 'opacity-100');
                content.classList.add('max-h-0', 'opacity-0');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                content.classList.remove('max-h-0', 'opacity-0');
                content.classList.add('max-h-96', 'opacity-100');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}