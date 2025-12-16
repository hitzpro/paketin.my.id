// src/scripts/profiles/fontsize.js

export function initFontSize() {
    const buttons = document.querySelectorAll(".btn-font-size");
    const html = document.documentElement; // Target HTML, bukan Body

    // 1. Terapkan ukuran tersimpan (sudah dihandle script di head, tapi ini untuk safety)
    const saved = localStorage.getItem("fontSize") || "medium";
    updateUI(saved);

    buttons.forEach(btn => {
        if (btn.dataset.hasListener === "true") return;

        btn.addEventListener("click", () => {
            const size = btn.dataset.size; // "small", "medium", "large"
            if (size) {
                // Set Attribute di HTML
                html.setAttribute("data-font-size", size);
                
                // Simpan ke LocalStorage
                localStorage.setItem("fontSize", size);
                
                // Update tombol aktif
                updateUI(size);
            }
        });

        btn.dataset.hasListener = "true";
    });

    function updateUI(activeSize) {
        // Hapus class aktif dari semua tombol
        buttons.forEach(b => {
            b.classList.remove("ring-2", "ring-offset-2", "ring-indigo-500"); // Contoh style aktif
            
            // Jika tombol ini sesuai dengan size yang aktif
            if(b.dataset.size === activeSize) {
                b.classList.add("ring-2", "ring-offset-2", "ring-indigo-500");
            }
        });
    }
}