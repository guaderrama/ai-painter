/**
 * Sharing Feature Module
 * Handles social sharing (Instagram, TikTok, Facebook, WhatsApp)
 */

import { showToast } from '../../shared/utils/toast.js';
import { APP_CONFIG } from '../../shared/config/api.js';

let currentArtworkUrl = null;
let currentOriginalUrl = null;

/**
 * Converts a Data URL to Blob using atob() - more reliable on iOS Safari
 * @param {string} dataUrl - Data URL to convert
 * @returns {Promise<Blob>} - The blob
 */
async function dataUrlToBlob(dataUrl) {
    if (dataUrl.startsWith('data:')) {
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)[1];
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } else {
        // For regular URLs, use fetch
        const response = await fetch(dataUrl);
        return await response.blob();
    }
}

export function initSharing() {
    // Initial setup - actual sharing is configured when artwork is ready
}

export function setupSocialSharing(originalUrl, artworkUrl) {
    currentArtworkUrl = artworkUrl;
    currentOriginalUrl = originalUrl;

    setupShareMenu();
    setupInstagramSharing();
    setupInstagramStorySharing();
    setupTikTokSharing();
    setupFacebookSharing();
    setupWhatsAppSharing();
}

function setupShareMenu() {
    const shareMenuBtn = document.getElementById('share-menu-btn');
    const shareOptions = document.getElementById('share-options');

    if (shareMenuBtn && shareOptions) {
        shareMenuBtn.addEventListener('click', () => {
            shareOptions.classList.toggle('hidden');
            shareOptions.classList.toggle('flex');
        });
    }
}

function setupInstagramStorySharing() {
    const shareStoryBtn = document.getElementById('share-instagram-story');

    if (shareStoryBtn) {
        shareStoryBtn.addEventListener('click', async () => {
            try {
                // Use Web Share API (works on iOS and Android)
                if (navigator.share) {
                    const blob = await dataUrlToBlob(currentArtworkUrl);
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork'
                        });
                        return;
                    }
                }

                // Fallback: download for desktop
                downloadArtwork('artwork-story.png');
                showToast('Image downloaded! Open Instagram to share.', 'info');
            } catch (error) {
                if (error.name === 'AbortError') return; // User cancelled
                console.error('Error sharing to Instagram Story:', error);
                showToast('Could not share to Instagram', 'error');
            }
        });
    }
}

function setupTikTokSharing() {
    const shareTikTok = document.getElementById('share-tiktok');

    if (shareTikTok) {
        shareTikTok.addEventListener('click', async () => {
            try {
                // Use Web Share API (works on iOS and Android)
                if (navigator.share) {
                    const blob = await dataUrlToBlob(currentArtworkUrl);
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork'
                        });
                        return;
                    }
                }

                // Fallback: download for desktop
                downloadArtwork('artwork-tiktok.png');
                showToast('Image downloaded! Open TikTok to share.', 'info');
            } catch (error) {
                if (error.name === 'AbortError') return; // User cancelled
                console.error('Error sharing to TikTok:', error);
                showToast('Could not share to TikTok', 'error');
            }
        });
    }
}

function setupInstagramSharing() {
    const shareInstagram = document.getElementById('share-instagram');

    if (shareInstagram) {
        shareInstagram.addEventListener('click', async () => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            try {
                // Use Web Share API (works on iOS and Android)
                if (navigator.share) {
                    const blob = await dataUrlToBlob(currentArtworkUrl);
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork'
                        });
                        return;
                    }
                }

                // Fallback: download for desktop
                if (!isIOS) {
                    downloadArtwork('artwork-instagram.png');
                    showToast('Image downloaded! Open Instagram to share.', 'info');
                } else {
                    showToast('Could not share to Instagram', 'error');
                }
            } catch (error) {
                if (error.name === 'AbortError') return; // User cancelled
                console.error('Error sharing to Instagram:', error);
                showToast('Could not share to Instagram', 'error');
            }
        });
    }
}

function setupWhatsAppSharing() {
    const shareWhatsApp = document.getElementById('share-whatsapp');

    if (shareWhatsApp) {
        shareWhatsApp.addEventListener('click', async () => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            try {
                // iOS/Android with Web Share API - share file directly
                if (navigator.share) {
                    const blob = await dataUrlToBlob(currentArtworkUrl);
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork'
                        });
                        return;
                    }
                }

                // Fallback: WhatsApp URL scheme (text only)
                const text = encodeURIComponent('Check out my artwork created with AI!');
                const waUrl = `https://wa.me/?text=${text}`;
                window.open(waUrl, '_blank');

                // On desktop, also download the image
                if (!isIOS) {
                    setTimeout(() => downloadArtwork('artwork-whatsapp.png'), 500);
                }
            } catch (error) {
                if (error.name === 'AbortError') return; // User cancelled
                console.log('Web Share failed, falling back to WhatsApp link');

                const text = encodeURIComponent('Check out my artwork!');
                window.open(`https://wa.me/?text=${text}`, '_blank');
            }
        });
    }
}

function setupFacebookSharing() {
    const shareFacebook = document.getElementById('share-facebook');

    if (shareFacebook) {
        shareFacebook.addEventListener('click', async () => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            try {
                // iOS: Try Web Share API first (opens native Share Sheet)
                if (isIOS && navigator.share) {
                    const blob = await dataUrlToBlob(currentArtworkUrl);
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork'
                        });
                        return;
                    }
                }

                // Fallback: Facebook Share Dialog (shares URL, not image directly)
                // Facebook doesn't allow sharing images directly from web
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_CONFIG.appUrl)}`;
                window.open(fbUrl, '_blank', 'width=600,height=400');

                // On desktop, also download the image so user can upload it manually
                if (!isIOS) {
                    downloadArtwork('artwork-facebook.png');
                    showToast('Image downloaded. Upload it to Facebook!', 'info');
                }
            } catch (error) {
                if (error.name === 'AbortError') return; // User cancelled
                console.error('Error sharing to Facebook:', error);

                // Fallback to Facebook dialog
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_CONFIG.appUrl)}`;
                window.open(fbUrl, '_blank', 'width=600,height=400');
            }
        });
    }
}

function downloadArtwork(filename) {
    const a = document.createElement('a');
    a.href = currentArtworkUrl;
    a.download = filename;
    a.click();
}
