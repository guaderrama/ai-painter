/**
 * Main Entry Point
 * AI Painter - Interactive Art Gallery
 *
 * This file initializes all features and coordinates the application.
 * Architecture: Feature-First Modular Design
 */

// Shared utilities
import { initScreens, showScreen } from './shared/ui/screens.js';
import { setupPasswordToggles } from './shared/ui/password-toggle.js';
import { setupInlineValidation } from './shared/utils/validation.js';

// Features
import { initAuth } from './features/auth/index.js';
import { initWelcome, showWelcomeScreen } from './features/welcome/index.js';
import { initUpload } from './features/upload/index.js';
import { initGallery, setupBeforeAfterComparison, setupDownloadButton } from './features/gallery/index.js';
import { initSharing, setupSocialSharing } from './features/sharing/index.js';
import { initPayments } from './features/payments/index.js';

/**
 * Application Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log('%c[APP] Initializing AI Painter...', 'color: #1980e6; font-weight: bold;');

    // Initialize screens first
    initScreens();

    // Initialize shared UI components
    setupPasswordToggles();
    setupInlineValidation();

    // Initialize features
    initGallery();
    initSharing();
    initPayments();

    // Initialize upload with callback for when processing completes
    initUpload(handleProcessingComplete);

    // Initialize welcome and check if user has seen it
    const shouldShowWelcome = initWelcome();

    // Initialize auth (this will handle showing the correct screen based on auth state)
    initAuth();

    // Show welcome screen for first-time users (before auth kicks in)
    if (shouldShowWelcome) {
        showWelcomeScreen();
    }

    console.log('%c[APP] AI Painter initialized successfully!', 'color: #22c55e; font-weight: bold;');
});

/**
 * Callback when image processing completes
 * Coordinates gallery and sharing setup
 */
function handleProcessingComplete(originalUrl, artworkUrl) {
    // Setup before/after comparison
    setupBeforeAfterComparison(originalUrl, artworkUrl);

    // Setup download button
    setupDownloadButton(artworkUrl);

    // Setup social sharing
    setupSocialSharing(originalUrl, artworkUrl);
}

// Export for potential external use
export { handleProcessingComplete };
