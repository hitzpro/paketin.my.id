export function initSession() {
    const userStr = localStorage.getItem("paketin_user");
    if (!userStr) {
        window.location.href = "/auth/login";
        return null;
    }
    return JSON.parse(userStr);
}
