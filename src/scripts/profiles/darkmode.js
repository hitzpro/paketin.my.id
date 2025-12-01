export function initDarkMode() {
    // support both ids that appear in different components
    const toggle = document.getElementById("toggle-darkmode") || document.getElementById("toggle-dark-mode");
    const html = document.documentElement;

    if (!toggle) return;

    toggle.checked = html.classList.contains("dark");

    // remove existing listeners by cloning node
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    newToggle.addEventListener("change", (e) => {
        const isDark = e.target.checked;

        if (isDark) {
            html.classList.add("dark");
            html.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            html.classList.remove("dark");
            html.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    });
}
