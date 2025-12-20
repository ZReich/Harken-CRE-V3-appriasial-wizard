export function setLocalStorage(key: string, value: string) {
    if (isBrowser()) {
        localStorage.setItem(key, value);
    }

    return null;
}

export function getLocalStorage(key: string) {
    if (isBrowser()) {
        return localStorage.getItem(key);
    }

    return null;
}
export function removeLocalStorage(key: string) {
    if (isBrowser()) {
        localStorage.removeItem(key);
    }

    return null;
}
function isBrowser() {
    return window && window.localStorage !== undefined;
}