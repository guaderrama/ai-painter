/**
 * Password Toggle Functionality
 * Show/hide password inputs
 */

const EYE_ICON_VISIBLE = '<path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>';

const EYE_ICON_HIDDEN = '<path d="M53.92 34.62L34.62 53.92C33.09 51.84 32 49.08 32 46C32 38.27 38.27 32 46 32C49.08 32 51.84 33.09 53.92 34.62ZM46 64C38.27 64 32 57.73 32 50C32 46.92 33.09 44.16 34.62 42.08L53.92 61.38C51.84 62.91 49.08 64 46 64ZM46 20C69 20 88 38 88 46C88 48.84 87.44 51.55 86.41 54L100.28 67.87C99.89 68.26 99.41 68.5 98.88 68.5C98.35 68.5 97.87 68.26 97.48 67.87L28.13 -1.48C27.74 -1.87 27.5 -2.35 27.5 -2.88C27.5 -3.41 27.74 -3.89 28.13 -4.28C28.91 -5.06 30.19 -5.06 30.97 -4.28L44.84 9.59C45.22 9.53 45.61 9.5 46 9.5C50.97 9.5 55 13.53 55 18.5C55 18.89 54.97 19.28 54.91 19.66L68.78 33.53C70.31 35.06 72 36.38 73.84 37.47L86.41 54C87.44 51.55 88 48.84 88 46C88 38 69 20 46 20Z"/>';

export function setupPasswordToggles() {
    const toggles = [
        {
            button: document.getElementById('toggle-login-password'),
            input: document.getElementById('login-password-input'),
            icon: document.getElementById('eye-icon-login')
        },
        {
            button: document.getElementById('toggle-signup-password'),
            input: document.getElementById('signup-password-input'),
            icon: document.getElementById('eye-icon-signup')
        },
        {
            button: document.getElementById('toggle-signup-confirm-password'),
            input: document.getElementById('signup-confirm-password-input'),
            icon: document.getElementById('eye-icon-signup-confirm')
        }
    ];

    toggles.forEach(({ button, input, icon }) => {
        if (button && input) {
            button.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                // Update icon
                if (icon) {
                    icon.innerHTML = isPassword ? EYE_ICON_HIDDEN : EYE_ICON_VISIBLE;
                }
            });
        }
    });
}
