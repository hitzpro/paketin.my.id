import { apiGet } from "../../utils/api.js";

export async function loadUserData(dom, user) {

    try {
        // 1. Panggil API
        const response = await apiGet(`/user/${user.id}`);

        // 2. Cek apakah request sukses (menggunakan properti .ok dari api.js baru)
        if (response.ok && response.data) {
            
            // 3. Ambil data JSON aslinya dari properti .data
            const result = response.data; 

            // 4. Baru cek properti .user di dalamnya
            if (result.user) {
                const u = result.user;

                if (dom.inputName) dom.inputName.value = u.name || "";
                if (dom.inputEmail) dom.inputEmail.value = u.email || "";
                if (dom.inputPhone) dom.inputPhone.value = u.phone_number || "";

                if (u.profile_picture && dom.imgPreview) {
                    dom.imgPreview.src = u.profile_picture;
                }

                dom.state.originalData = { ...u };
                console.log("Data berhasil dimuat:", u);
            } else {
                console.warn("User object tidak ditemukan dalam response:", result);
            }
        } else {
            // Menangani jika API merespon error (misal 404 atau 500)
            console.error("Gagal load user:", response.error);
            window.showToast?.(response.error || "Gagal memuat data", "error");
        }

    } catch (err) {
        console.error("Error script:", err);
        window.showToast?.("Terjadi kesalahan sistem", "error");
    }
}