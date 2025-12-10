/**
 * Toast Notification System
 * Shows temporary notifications to the user
 */

const TOAST_COLORS = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white'
};

const TOAST_ICONS = {
    success: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
    error: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
    info: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
};

export function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${TOAST_COLORS[type]}`;
    // Create icon element (trusted SVG content)
    const iconWrapper = document.createElement('span');
    iconWrapper.innerHTML = TOAST_ICONS[type];

    // Create message element (safely escaped text)
    const messageSpan = document.createElement('span');
    messageSpan.className = 'font-semibold';
    messageSpan.textContent = message; // Safe: textContent escapes HTML

    toast.appendChild(iconWrapper);
    toast.appendChild(messageSpan);

    document.body.appendChild(toast);

    // Slide in animation
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
