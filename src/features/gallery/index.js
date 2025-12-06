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

    // Event listeners for buttons
    if (showTransformedBtn) showTransformedBtn.addEventListener('click', showTransformed);
    if (showOriginalBtn) showOriginalBtn.addEventListener('click', showOriginal);
    if (showSliderBtn) showSliderBtn.addEventListener('click', showSlider);

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
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = artworkUrl;
            a.download = `artwork-${Date.now()}.png`;
            a.click();

            showToast('Artwork downloaded!', 'success');
        };
    }
}
