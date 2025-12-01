import { initSession } from "./session.js";
import { initDarkMode } from "./darkmode.js";
import { initFavorites } from "./favorites.js";
import { initHistory } from "./history.js";
import { initFontSize } from "./fontsize.js";
import { initDeleteAccount } from "./delete-account.js";

import { initProfileForm } from "./profile-form.js";

document.addEventListener("astro:page-load", () => {

    const user = initSession();
    if (!user) return;

    initDarkMode();
    initFavorites(user);
    initHistory(user);
    initFontSize();
    initDeleteAccount(user);
    initProfileForm(user);  
});
