import { apiPost } from "../../utils/api.js";

export function setupSaveProfile(dom, user) {
    if (!dom.btnConfirmSave) return;

    const btn = dom.btnConfirmSave.cloneNode(true);
    dom.btnConfirmSave.parentNode.replaceChild(btn, dom.btnConfirmSave);
    
    btn.innerText = "Ya, Simpan";

    btn.addEventListener("click", async () => {
        const payload = {
            user_id: user.id,
            name: dom.inputName?.value,
            email: dom.inputEmail?.value,
            password: dom.inputPassword?.value || undefined,
            profile_picture: dom.state.newProfilePictureBase64 || undefined,
        };

        const result = await apiPost("/user/update", payload);

        if (result.user) {
            window.showToast?.("Profil berhasil diperbarui!", "success");

            const updated = { ...user, ...result.user };
            localStorage.setItem("paketin_user", JSON.stringify(updated));
            dom.state.originalData = result.user;

            dom.disableEditMode();
            setTimeout(() => window.location.reload(), 600);
        } else {
            window.showToast?.(result.message || "Gagal update", "error");
        }
    });
}
