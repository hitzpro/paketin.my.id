export function getDOM() {
    return {
        // Inputs
        inputName: document.getElementById("input-name"),
        inputEmail: document.getElementById("input-email"),
        inputPhone: document.getElementById("input-phone"),
        inputPassword: document.getElementById("input-password"),

        // Buttons
        btnToggleEdit: document.getElementById("btn-toggle-edit"),
        btnEditText: document.getElementById("btn-edit-text"),
        btnCancel: document.getElementById("btn-cancel"),
        btnSaveTrigger: document.getElementById("btn-save-trigger"),

        // Layout
        actionButtons: document.getElementById("edit-actions"),

        // Images
        imgInput: document.getElementById("profile-image-input"),
        imgPreview: document.getElementById("profile-image-preview"),
        imgLabel: document.getElementById("profile-image-label"),
        canvas: document.getElementById("image-canvas"),

        // Modal
        btnConfirmSave: document.getElementById("save_profile_modal-confirm-btn"),

        // State
        state: {
            isEditing: false,
            originalData: {},
            newProfilePictureBase64: null,
        },
    };
}
