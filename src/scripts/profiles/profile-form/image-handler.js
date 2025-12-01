export function setupImageHandler(dom) {
    if (!dom.imgInput || !dom.canvas || !dom.imgPreview) return;

    dom.imgInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            window.showToast?.("Ukuran foto maksimal 2MB", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const ctx = dom.canvas.getContext("2d");
                if (!ctx) return;

                const MAX_WIDTH = 300;
                const scaleSize = MAX_WIDTH / img.width;

                dom.canvas.width = MAX_WIDTH;
                dom.canvas.height = img.height * scaleSize;

                ctx.drawImage(img, 0, 0, dom.canvas.width, dom.canvas.height);

                const dataUrl = dom.canvas.toDataURL("image/jpeg", 0.7);
                dom.imgPreview.src = dataUrl;
                dom.state.newProfilePictureBase64 = dataUrl;
            };

            img.src = ev.target.result;
        };

        reader.readAsDataURL(file);
    };
}
