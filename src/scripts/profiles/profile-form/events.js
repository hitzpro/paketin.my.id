export function setupEvents(dom) {
    dom.btnToggleEdit?.addEventListener("click", () => {
        if (!dom.state.isEditing) dom.enableEditMode();
    });

    dom.btnCancel?.addEventListener("click", () => {
        dom.disableEditMode();

        if (dom.inputName)
            dom.inputName.value = dom.state.originalData.name || "";

        if (dom.inputEmail)
            dom.inputEmail.value = dom.state.originalData.email || "";

        dom.state.newProfilePictureBase64 = null;
    });

    dom.btnSaveTrigger?.addEventListener("click", () => {
        window["openModal_save_profile_modal"]?.();
    });
}
