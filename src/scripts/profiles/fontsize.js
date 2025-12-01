// src/scripts/profiles/fontsize.js

export function initFontSize() {
    const buttons = document.querySelectorAll(".btn-font-size");
    const body = document.body;

    // 1. Terapkan ukuran font tersimpan saat load
    const saved = localStorage.getItem("fontSize") || "medium";
    apply(saved);

    // 2. Loop semua tombol font size (termasuk btn-font-small/large jika ada class-nya)
    buttons.forEach(btn => {
        // CEK: Apakah listener sudah terpasang?
        if (btn.dataset.hasListener === "true") return;

        btn.addEventListener("click", () => {
            // Ambil size dari data-size="small/medium/large"
            const size = btn.dataset.size; 
            if (size) {
                apply(size);
                localStorage.setItem("fontSize", size);
                
                // Opsional: Update UI tombol aktif (visual feedback)
                updateActiveButton(buttons, btn);
            }
        });

        // Tandai sudah dipasang
        btn.dataset.hasListener = "true";
    });

    function apply(size) {
        body.classList.remove("text-sm", "text-base", "text-lg");

        if (size === "small") body.classList.add("text-sm");
        else if (size === "large") body.classList.add("text-lg");
        else body.classList.add("text-base"); // Default medium
    }

    // Helper visual (opsional)
    function updateActiveButton(allBtns, activeBtn) {
        allBtns.forEach(b => b.classList.remove("btn-active", "btn-primary"));
        activeBtn.classList.add("btn-active", "btn-primary");
    }
}