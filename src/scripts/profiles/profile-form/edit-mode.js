export function setupEditMode(dom) {

    function setEdit(active) {
        dom.state.isEditing = active;

        const editableInputs = [
            dom.inputName,
            dom.inputEmail,
            dom.inputPassword,
        ];

        editableInputs.forEach(input => {
            if (!input) return;
            input.disabled = !active;

            if (active) {
                input.classList.remove("bg-gray-50", "dark:bg-gray-700");
                input.classList.add("bg-white", "dark:bg-gray-900");
            } else {
                input.classList.add("bg-gray-50", "dark:bg-gray-800");
                input.classList.remove("bg-white", "dark:bg-gray-900");
            }
        });

        if (dom.inputPassword) dom.inputPassword.value = "";

        if (active) {
            dom.btnEditText.innerText = "Mode Edit Aktif";
            dom.actionButtons.classList.remove("hidden");
            dom.imgLabel.classList.remove("hidden");
            dom.imgInput.disabled = false;
        } else {
            dom.btnEditText.innerText = "Ubah Profil";
            dom.actionButtons.classList.add("hidden");
            dom.imgLabel.classList.add("hidden");
            dom.imgInput.disabled = true;

            // reset gambar
            if (dom.state.originalData.profile_picture && dom.imgPreview) {
                dom.imgPreview.src = dom.state.originalData.profile_picture;
            }
        }
    }

    dom.enableEditMode = () => setEdit(true);
    dom.disableEditMode = () => setEdit(false);
}
