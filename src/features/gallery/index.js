/**
 * Gallery Feature Module
 * Handles before/after image comparison
 */

import { showToast } from '../../shared/utils/toast.js';

let isDragging = false;
let cleanupFunctions = [];

export function initGallery() {
    setupFullscreenButton();
}

/**
 * Cleanup gallery listeners to prevent memory leaks
 */
export function cleanupGallery() {
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions = [];
}

export function setupBeforeAfterComparison(originalUrl, transformedUrl) {
    const showTransformedBtn = document.getElementById('show-transformed');
    const showOriginalBtn = document.getElementById('show-original');
    const showSliderBtn = document.getElementById('show-slider');
    const sliderHandle = document.getElementById('slider-handle');
    const transformedContainer = document.getElementById('transformed-container');

    // Show Transformed (default)
    function showTransformed() {
        if (transformedContainer) transformedContainer.style.clipPath = 'inset(0 0 0 0)';
        if (sliderHandle) sliderHandle.classList.add('hidden');
        updateActiveButton(showTransformedBtn);
    }

    // Show Original only
    function showOriginal() {
        if (transformedContainer) transformedContainer.style.clipPath = 'inset(0 100% 0 0)';
        if (sliderHandle) sliderHandle.classList.add('hidden');
        updateActiveButton(showOriginalBtn);
    }

    // Show Slider comparison
    function showSlider() {
        if (transformedContainer) transformedContainer.style.clipPath = 'inset(0 50% 0 0)';
        if (sliderHandle) {
            sliderHandle.classList.remove('hidden');
            sliderHandle.style.left = '50%';
        }
        updateActiveButton(showSliderBtn);
    }

    function updateActiveButton(activeBtn) {
        [showTransformedBtn, showOriginalBtn, showSliderBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Slider dragging logic
    function handleSliderMove(e) {
        if (!isDragging && e.type !== 'click') return;

        const container = document.querySelector('#comparison-container > div');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        if (sliderHandle) sliderHandle.style.left = `${percentage}%`;
        if (transformedContainer) transformedContainer.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }

    // Event listeners for buttons (with cleanup tracking)
    if (showTransformedBtn) {
        showTransformedBtn.addEventListener('click', showTransformed);
        cleanupFunctions.push(() => showTransformedBtn.removeEventListener('click', showTransformed));
    }
    if (showOriginalBtn) {
        showOriginalBtn.addEventListener('click', showOriginal);
        cleanupFunctions.push(() => showOriginalBtn.removeEventListener('click', showOriginal));
    }
    if (showSliderBtn) {
        showSliderBtn.addEventListener('click', showSlider);
        cleanupFunctions.push(() => showSliderBtn.removeEventListener('click', showSlider));
    }

    // Event listeners for slider (with cleanup tracking)
    if (sliderHandle) {
        const onMouseDown = () => isDragging = true;
        const onMouseUp = () => isDragging = false;
        const onTouchStart = () => isDragging = true;
        const onTouchEnd = () => isDragging = false;

        sliderHandle.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', handleSliderMove);

        // Touch events
        sliderHandle.addEventListener('touchstart', onTouchStart);
        document.addEventListener('touchend', onTouchEnd);
        document.addEventListener('touchmove', handleSliderMove);

        // Register cleanup functions
        cleanupFunctions.push(() => {
            sliderHandle.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', handleSliderMove);
            sliderHandle.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchmove', handleSliderMove);
        });
    }

    // Initialize with transformed view
    showTransformed();
}

function setupFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const comparisonContainer = document.getElementById('comparison-container');

    if (fullscreenBtn && comparisonContainer) {
        fullscreenBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                comparisonContainer.requestFullscreen().catch(err => {
                    console.error('Error entering fullscreen:', err);
                });
            }
        });
    }
}

export function setupDownloadButton(artworkUrl) {
    const downloadBtn = document.getElementById('download-artwork');

    if (downloadBtn) {
        downloadBtn.onclick = async () => {
            // Detect iOS/iPadOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS) {
                // iOS: Open Share Sheet directly - user can tap "Save Image" to save to Photos
                try {
                    downloadBtn.disabled = true;
                    const originalText = downloadBtn.innerHTML;
                    downloadBtn.innerHTML = '<span class="truncate">Opening...</span>';

                    // Convert Data URL to Blob
                    let blob;
                    if (artworkUrl.startsWith('data:')) {
                        const parts = artworkUrl.split(',');
                        const mime = parts[0].match(/:(.*?);/)[1];
                        const bstr = atob(parts[1]);
                        let n = bstr.length;
                        const u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        blob = new Blob([u8arr], { type: mime });
                    } else {
                        const response = await fetch(artworkUrl);
                        blob = await response.blob();
                    }

                    downloadBtn.innerHTML = originalText;
                    downloadBtn.disabled = false;

                    // Try multiple approaches for iOS
                    if (navigator.share) {
                        try {
                            // Method 1: Try with File object
                            const file = new File([blob], 'artwork.png', { type: 'image/png' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({ files: [file] });
                                return;
                            }
                        } catch (e) {
                            console.log('File share failed, trying blob URL method');
                        }

                        // Method 2: Share URL only (at least opens share sheet)
                        try {
                            await navigator.share({
                                title: 'My AI Artwork',
                                text: 'Check out my artwork!',
                                url: window.location.href
                            });
                            return;
                        } catch (e) {
                            if (e.name === 'AbortError') return;
                        }
                    }

                    // Method 3: Fallback - create blob URL and open in new tab
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                    showToast('Long press the image to save', 'info');
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

                } catch (error) {
                    downloadBtn.disabled = false;
                    downloadBtn.innerHTML = '<span class="truncate">Download</span>';

                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                        showToast('Could not save image', 'error');
                    }
                }
            } else {
                // Desktop/Android: Standard download
                const a = document.createElement('a');
                a.href = artworkUrl;
                a.download = `artwork-${Date.now()}.png`;
                a.click();
                showToast('Artwork downloaded!', 'success');
            }
        };
    }
}

/**
 * Shows the iOS-native save modal for long-press image saving
 * @param {string} imageUrl - The URL of the image to save (can be Data URL or HTTP URL)
 */
async function showIOSSaveModal(imageUrl) {
    const modal = document.getElementById('ios-save-modal');
    const image = document.getElementById('ios-save-image');
    const closeBtn = document.getElementById('close-ios-modal');
    const shareBtn = document.getElementById('ios-share-btn');

    if (!modal || !image) {
        console.error('iOS Save Modal elements not found');
        showToast('Could not open save dialog', 'error');
        return;
    }

    // Convert Data URL to Blob URL for better iOS compatibility
    let displayUrl = imageUrl;
    let blobUrl = null;

    if (imageUrl.startsWith('data:')) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            blobUrl = URL.createObjectURL(blob);
            displayUrl = blobUrl;
        } catch (e) {
            console.error('Error converting data URL:', e);
            displayUrl = imageUrl; // Fallback to original
        }
    }

    // Set image source and show modal
    image.src = displayUrl;
    modal.classList.remove('hidden');

    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';

    // Close modal handler
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        // Clean up blob URL
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
        }
    };

    // Close button click
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    // Close on backdrop click (but not on image)
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    // Share button - opens native iOS Share Sheet
    if (shareBtn) {
        shareBtn.onclick = async () => {
            try {
                // Convert original imageUrl to blob for sharing
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], 'artwork.png', { type: 'image/png' });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'My AI Artwork'
                    });
                } else {
                    // Fallback: share URL only
                    await navigator.share({
                        title: 'My AI Artwork',
                        text: 'Check out my artwork created with AI!',
                        url: window.location.href
                    });
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                    showToast('Could not share', 'error');
                }
            }
        };
    }
}
