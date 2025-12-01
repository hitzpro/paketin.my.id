import { getDOM } from "./profile-form/dom.js";
import { loadUserData } from "./profile-form/loader.js";
import { setupEditMode } from "./profile-form/edit-mode.js";
import { setupImageHandler } from "./profile-form/image-handler.js";
import { setupEvents } from "./profile-form/events.js";
import { setupSaveProfile } from "./profile-form/save.js";

export function initProfileForm(user) {
    const form = document.getElementById("profile-form");
    if (!form) return; // tidak sedang di halaman profile

    const dom = getDOM();

    setupEditMode(dom);
    setupImageHandler(dom);
    setupEvents(dom);
    setupSaveProfile(dom, user);

    loadUserData(dom, user);
}
