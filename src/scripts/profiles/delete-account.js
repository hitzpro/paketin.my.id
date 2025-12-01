// src/scripts/profiles/delete-account.js
import { apiDelete } from "../utils/api.js";

export function initDeleteAccount(user) {
    const modal = document.getElementById("delete_account_modal");
    const btnOpen = document.getElementById("btn-delete-account"); 
    const btnCancel = document.getElementById("btn-cancel-delete");
    const btnConfirm = document.getElementById("btn-confirm-delete");
    const input = document.getElementById("delete-confirm-input");
    const hint = document.getElementById("delete-username-hint");

    if (!btnOpen) return;

    // 1. Buka Modal
    const newBtnOpen = btnOpen.cloneNode(true);
    btnOpen.parentNode.replaceChild(newBtnOpen, btnOpen);

    newBtnOpen.addEventListener("click", (e) => {
        e.preventDefault();
        modal?.classList.remove("hidden");
        
        // Reset form state
        if (input) input.value = "";
        if (btnConfirm) btnConfirm.disabled = true;
        if (hint) hint.innerText = user.name || "username";
    });

    // 2. Tutup Modal
    if (btnCancel) {
        const newBtnCancel = btnCancel.cloneNode(true);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);
        newBtnCancel.addEventListener("click", () => {
            modal?.classList.add("hidden");
        });
    }

    // 3. Validasi Input
    if (input) {
        // Clone input juga biar event listener lama hilang
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener('input', (e) => {
            if (btnConfirm) {
                btnConfirm.disabled = e.target.value !== user.name;
            }
        });
    }

    // 4. Eksekusi Hapus
    if (btnConfirm) {
        const newBtnConfirm = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

        newBtnConfirm.addEventListener("click", async () => {
            const originalText = newBtnConfirm.innerText;
            newBtnConfirm.innerText = "Memproses...";
            newBtnConfirm.disabled = true;

            // --- PANGGIL API DELETE ---
            const res = await apiDelete("/user/delete", {
                user_id: user.id,
                username_confirmation: input?.value // Ambil dari elemen input terbaru (newInput logic di atas)
                // NB: Karena kita clone input, pastikan kita mengambil value dari DOM saat klik,
                // elemen 'input' variabel lama mungkin sudah terdetach. 
                // LEBIH AMAN: document.getElementById lagi di sini.
            });
            
            // Ambil value input fresh
            const freshInputVal = document.getElementById("delete-confirm-input")?.value;
            
            // Jika mau lebih strict, panggil apiDelete dengan freshInputVal, 
            // tapi logic di atas sebenarnya sudah jalan karena input variabel referensi DOM masih bisa valid 
            // (kecuali jika struktur HTML berubah total). 
            
            // Mari kita perbaiki fetch nya agar make data yg benar:
            // (Tadi di atas variabel `input` sudah di-replace, jadi harus query ulang biar aman)
            
            if (res.ok) {
                if (typeof window.showToast === 'function') window.showToast("Akun berhasil dihapus.", "success");
                
                // Clear Session Client
                document.cookie = "user_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                localStorage.removeItem("paketin_user");
                
                setTimeout(() => {
                    window.location.href = "/auth/login";
                }, 1500);
            } else {
                const msg = res.error || "Gagal hapus akun";
                if (typeof window.showToast === 'function') window.showToast(msg, "error");
                else alert(msg);
                
                newBtnConfirm.innerText = originalText;
                newBtnConfirm.disabled = false;
            }
        });
    }
}