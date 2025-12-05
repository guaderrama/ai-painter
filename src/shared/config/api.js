/**
 * API Configuration
 * Centralizes API endpoints and constants
 */

export const API_ENDPOINTS = {
    generate: 'https://api-255643153942.us-central1.run.app/generate'
};

export const APP_CONFIG = {
    appUrl: 'https://ai-painter-app.web.app',
    initialCredits: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
};
