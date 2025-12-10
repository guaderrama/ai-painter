/**
 * History Feature Module
 * Displays user's recent artworks (last 10, expires after 15 days)
 */

import { db, auth } from '../../shared/config/firebase.js';
import { showToast } from '../../shared/utils/toast.js';

let userArtworks = [];

/**
 * Detect MIME type from base64 data
 * @param {string} base64 - Base64 encoded image
 * @returns {string} - MIME type
 */
function getMimeType(base64) {
    // JPEG starts with /9j/ (FFD8FF in hex)
    if (base64 && base64.startsWith('/9j/')) {
        return 'image/jpeg';
    }
    return 'image/png';
}

/**
 * Get file extension from base64 data
 * @param {string} base64 - Base64 encoded image
 * @returns {string} - File extension
 */
function getFileExtension(base64) {
    return getMimeType(base64) === 'image/jpeg' ? 'jpg' : 'png';
}

/**
 * Get image URL from artwork (supports both base64 and URL formats)
 * @param {Object} artwork - Artwork data
 * @returns {string} - Data URL or HTTP URL
 */
function getImageUrl(artwork) {
    // New format: base64 stored directly in Firestore
    if (artwork.imageBase64) {
        return `data:${getMimeType(artwork.imageBase64)};base64,${artwork.imageBase64}`;
    }
    // Legacy format: URL to Storage
    return artwork.transformedUrl || '';
}

/**
 * Initialize history feature
 */
export function initHistory() {
    // History is loaded when user logs in (see loadUserHistory)
}

/**
 * Load user's artwork history from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of artwork objects
 */
export async function loadUserHistory(userId) {
    try {
        const artworksRef = db.collection('users').doc(userId)
            .collection('artworks')
            .orderBy('createdAt', 'desc')
            .limit(10);

        const snapshot = await artworksRef.get();

        userArtworks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to Date
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        console.log(`[History] Loaded ${userArtworks.length} artworks for user ${userId}`);

        // Render the history UI
        renderHistoryGrid();

        return userArtworks;
    } catch (error) {
        console.error('[History] Error loading artworks:', error);
        return [];
    }
}

/**
 * Render the history grid in the UI
 */
function renderHistoryGrid() {
    const historySection = document.getElementById('history-section');
    const historyGrid = document.getElementById('history-grid');

    if (!historySection || !historyGrid) {
        console.warn('[History] History section not found in DOM');
        return;
    }

    // Clear existing content
    historyGrid.innerHTML = '';

    if (userArtworks.length === 0) {
        historySection.classList.add('hidden');
        return;
    }

    // Show the section
    historySection.classList.remove('hidden');

    // Create artwork cards
    userArtworks.forEach((artwork, index) => {
        const card = createArtworkCard(artwork, index);
        historyGrid.appendChild(card);
    });
}

/**
 * Create an artwork card element
 * @param {Object} artwork - Artwork data
 * @param {number} index - Index for animation delay
 * @returns {HTMLElement}
 */
function createArtworkCard(artwork, index) {
    const card = document.createElement('div');
    card.className = 'history-card relative group cursor-pointer overflow-hidden rounded-lg aspect-square';
    card.style.animationDelay = `${index * 50}ms`;

    // Calculate days remaining
    const createdAt = artwork.createdAt;
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + 15);
    const daysRemaining = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));

    const imageUrl = getImageUrl(artwork);
    card.innerHTML = `
        <img
            src="${imageUrl}"
            alt="Artwork"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-2">
                <div class="flex justify-between items-center">
                    <span class="text-white text-xs">${daysRemaining}d left</span>
                    <div class="flex gap-1">
                        <button class="history-download p-1 bg-white/20 rounded hover:bg-white/40 transition-colors" title="Download">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                        </button>
                        <button class="history-share p-1 bg-white/20 rounded hover:bg-white/40 transition-colors" title="Share">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add click handlers
    const downloadBtn = card.querySelector('.history-download');
    const shareBtn = card.querySelector('.history-share');

    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadArtwork(artwork);
    });

    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareArtwork(artwork);
    });

    // Click on card to view full size
    card.addEventListener('click', () => {
        viewArtwork(artwork);
    });

    return card;
}

/**
 * Download artwork
 * @param {Object} artwork - Artwork data
 */
async function downloadArtwork(artwork) {
    try {
        const imageUrl = getImageUrl(artwork);
        let blobUrl;

        if (artwork.imageBase64) {
            // Convert base64 to blob directly
            const byteString = atob(artwork.imageBase64);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const mimeType = getMimeType(artwork.imageBase64);
            const blob = new Blob([ab], { type: mimeType });
            blobUrl = URL.createObjectURL(blob);
        } else {
            // Legacy: fetch from URL
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
        }

        const ext = artwork.imageBase64 ? getFileExtension(artwork.imageBase64) : 'png';
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `artwork-${artwork.id.substring(0, 8)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        showToast('Image downloaded!', 'success');
    } catch (error) {
        console.error('[History] Download error:', error);
        showToast('Download failed', 'error');
    }
}

/**
 * Share artwork using Web Share API
 * @param {Object} artwork - Artwork data
 */
async function shareArtwork(artwork) {
    try {
        let blob;

        if (artwork.imageBase64) {
            // Convert base64 to blob directly
            const byteString = atob(artwork.imageBase64);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const mimeType = getMimeType(artwork.imageBase64);
            blob = new Blob([ab], { type: mimeType });
        } else {
            // Legacy: fetch from URL
            const response = await fetch(artwork.transformedUrl);
            blob = await response.blob();
        }

        const mimeType = artwork.imageBase64 ? getMimeType(artwork.imageBase64) : 'image/png';
        const ext = artwork.imageBase64 ? getFileExtension(artwork.imageBase64) : 'png';
        if (navigator.share) {
            const file = new File([blob], `artwork.${ext}`, { type: mimeType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My AI Artwork'
                });
                return;
            }
        }

        // Fallback: download the image (can't copy data URL to clipboard)
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `artwork-${artwork.id.substring(0, 8)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        showToast('Image saved!', 'success');
    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('[History] Share error:', error);
        showToast('Could not share', 'error');
    }
}

/**
 * View artwork in full size modal/lightbox
 * @param {Object} artwork - Artwork data
 */
function viewArtwork(artwork) {
    const imageUrl = getImageUrl(artwork);

    // Create lightbox modal
    const modal = document.createElement('div');
    modal.className = 'artwork-lightbox';
    modal.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
            <img src="${imageUrl}" alt="Artwork" class="lightbox-image" />
            <button class="lightbox-close" aria-label="Close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    // Close handlers
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
        setTimeout(() => modal.remove(), 300);
    };

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };
    document.addEventListener('keydown', handleEscape);

    modal.querySelector('.lightbox-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.lightbox-close').addEventListener('click', closeModal);
}

/**
 * Refresh history after creating new artwork
 */
export async function refreshHistory() {
    const user = auth.currentUser;
    if (user) {
        await loadUserHistory(user.uid);
    }
}

/**
 * Get current artworks
 * @returns {Array}
 */
export function getArtworks() {
    return userArtworks;
}
