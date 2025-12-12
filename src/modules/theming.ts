/**
 * modules/theming.ts
 * --
 * @author VJP
 * @written 30-Sep-2025
 */

export type ThemingType = "light" | "dark" | "system";
const COLOR_GRADIENTS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];


/**
 * Load the current theme (light/dark) and theme color based on saved preference or system settings.
 */
function loadTheme() {
    const root = document.documentElement;

    let preferredTheme = (localStorage.getItem("theme") || "system") as ThemingType
    if (preferredTheme === "system")
        preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    if (preferredTheme === "dark") {
        document.documentElement.classList.add("sl-theme-dark", "dark-mode");
    }
    else {
        document.documentElement.classList.remove("sl-theme-dark", "dark-mode");
    }
    // remove existing color theme from document's class list
    const classes = root.className.split(" ").filter(c => !c.startsWith("phi-theme-"));
    root.className = classes.join(" ").trim();
    // add selected theme's class to document
    let preferredColor = (localStorage.getItem("themeColor") || "phi-theme-01");
    root.classList.add(preferredColor);

    /*
    // the base color names.  Eg --sl-color-blue
    const primaryColor = getComputedStyle(root).getPropertyValue('--phi-primary-color').trim();
    const alternateColor = getComputedStyle(root).getPropertyValue('--phi-alternate-color').trim();

    for (const grad of COLOR_GRADIENTS) {
        const color1  = getComputedStyle(root).getPropertyValue(`--${primaryColor}-${grad}`).trim();
        const color2 = getComputedStyle(root).getPropertyValue(`--${alternateColor}-${grad}`).trim();
        root.style.setProperty(`--phi-color-primary-${grad}`, color1);
        root.style.setProperty(`--phi-color-alternate-${grad}`, color2);
    }
    */
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
 * Change the preferred theme color and load it.
 */
function setThemeColor(color: string): void {
    localStorage.setItem("themeColor", color);
    loadTheme();
}


/**
 * Get the current theme color.
 */
function getThemeColor() {
    return (localStorage.getItem("themeColor") || "default");
}


/**
 * Initialise Theme module and load preferred theme.
 */
function init() {
    loadTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        loadTheme();
    });

    window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === 'theme' || event.key === 'themeColor')
            loadTheme();
    })
}


// noinspection JSUnusedGlobalSymbols
export const Theming = {
    init: init,
    loadTheme: loadTheme,
    setTheme: setTheme,
    getTheme: getTheme,
    setThemeColor: setThemeColor,
    getThemeColor: getThemeColor,
    COLOR_GRADIENTS: COLOR_GRADIENTS,
}