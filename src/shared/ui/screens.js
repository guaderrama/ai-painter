/**
 * Screen Navigation
 * Manages showing/hiding screens in the SPA
 */

// Screen elements cache
let screens = null;

export function initScreens() {
    screens = {
        welcome: document.getElementById("welcome-screen"),
        login: document.getElementById("login-screen"),
        emailAuth: document.getElementById("email-auth-screen"),
        upload: document.getElementById("upload-screen"),
        processing: document.getElementById("processing-screen"),
        result: document.getElementById("result-screen"),
        limit: document.getElementById("limit-screen"),
        pricing: document.getElementById("pricing-screen"),
    };
    return screens;
}

export function showScreen(screenId) {
    if (!screens) {
        initScreens();
    }

    console.log(`%c[SCREEN] Attempting to show: ${screenId}`, 'color: blue; font-weight: bold;');

    // Hide all screens first
    for (let screenKey in screens) {
        if (screens[screenKey]) {
            screens[screenKey].classList.remove('active');
        }
    }

    // Show the requested screen
    if (screens[screenId]) {
        console.log(`%c[SCREEN] Successfully showing: ${screenId}`, 'color: green;');
        screens[screenId].classList.add('active');
    } else {
        console.error(`[SCREEN] ERROR: Screen element for "${screenId}" not found in DOM!`);
    }
}

export function getScreens() {
    return screens;
}
