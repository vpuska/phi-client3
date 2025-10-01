/**
 * modules/theming.ts
 * --
 * @author VJP
 * @written 30-Sep-2025
 */


export type ThemingType = "light" | "dark" | "system";

/**
 * Load the current theme (light/dark) based on saved preference or system settings.
 */
function loadTheme() {
    let preferredTheme = (localStorage.getItem("theme") || "system") as ThemingType
    if (preferredTheme === "system")
        preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    if (preferredTheme === "dark")
        document.documentElement.classList.add("sl-theme-dark", "dark-mode");
    else
        document.documentElement.classList.remove("sl-theme-dark", "dark-mode");
}


/**
 * Change the preferred theme and load it.
 * @param theme
 */
function setTheme(theme: ThemingType): void {
    localStorage.setItem("theme", theme);
    loadTheme();
}


/**
 * Get the current theme preference.
 */
function getTheme() {
    return (localStorage.getItem("theme") || "system") as ThemingType;
}


/**
 * Initialise Theme module and load preferred theme.
 */
function init() {
    loadTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        Theming.loadTheme();
    });

    window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === 'theme')
            loadTheme();
    })
}


// noinspection JSUnusedGlobalSymbols
export const Theming = {
    init: init,
    loadTheme: loadTheme,
    setTheme: setTheme,
    getTheme: getTheme,
}