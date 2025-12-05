/**
 * Sharing Feature Module
 * Handles social sharing, collages, and Instagram stories
 */

import { showToast } from '../../shared/utils/toast.js';
import { APP_CONFIG } from '../../shared/config/api.js';

let currentArtworkUrl = null;
let currentOriginalUrl = null;

export function initSharing() {
    // Initial setup - actual sharing is configured when artwork is ready
}

export function setupSocialSharing(originalUrl, artworkUrl) {
    currentArtworkUrl = artworkUrl;
    currentOriginalUrl = originalUrl;

    setupShareMenu();
    setupCollageGeneration();
    setupStoryGeneration();
    setupInstagramSharing();
    setupWhatsAppSharing();
    setupFacebookSharing();
    setupCopyLink();
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

function setupCollageGeneration() {
    const generateCollageBtn = document.getElementById('generate-collage');

    if (generateCollageBtn && currentOriginalUrl) {
        generateCollageBtn.addEventListener('click', async () => {
            try {
                generateCollageBtn.disabled = true;
                generateCollageBtn.innerHTML = '<span>Generating...</span>';

                const collageDataUrl = await generateBeforeAfterCollage(currentOriginalUrl, currentArtworkUrl);

                const a = document.createElement('a');
                a.href = collageDataUrl;
                a.download = `before-after-collage-${Date.now()}.png`;
                a.click();

                showToast('Collage generated and downloaded!', 'success');
                resetCollageButton(generateCollageBtn);
            } catch (error) {
                console.error('Error generating collage:', error);
                showToast('Failed to generate collage', 'error');
                generateCollageBtn.disabled = false;
            }
        });
    }
}

function setupStoryGeneration() {
    const generateStoryBtn = document.getElementById('generate-story');

    if (generateStoryBtn) {
        generateStoryBtn.addEventListener('click', async () => {
            try {
                generateStoryBtn.disabled = true;
                generateStoryBtn.innerHTML = '<span>Generating...</span>';

                const storyDataUrl = await generateInstagramStory(currentArtworkUrl);

                const a = document.createElement('a');
                a.href = storyDataUrl;
                a.download = `instagram-story-${Date.now()}.png`;
                a.click();

                showToast('Instagram Story generated!', 'success');
                resetStoryButton(generateStoryBtn);
            } catch (error) {
                console.error('Error generating story:', error);
                showToast('Failed to generate story', 'error');
                generateStoryBtn.disabled = false;
            }
        });
    }
}

function setupInstagramSharing() {
    const shareInstagram = document.getElementById('share-instagram');

    if (shareInstagram) {
        shareInstagram.addEventListener('click', async () => {
            try {
                const response = await fetch(currentArtworkUrl);
                const blob = await response.blob();
                const file = new File([blob], 'artwork.png', { type: 'image/png' });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'My AI Artwork',
                        text: 'Check out my artwork created with Iván Guaderrama\'s AI Gallery!'
                    });
                } else {
                    downloadArtwork('artwork-instagram-story.png');
                    alert('Image downloaded! Open Instagram and upload it as a story.');
                }
            } catch (error) {
                console.error('Error sharing to Instagram:', error);
                downloadArtwork('artwork-instagram.png');
            }
        });
    }
}

function setupWhatsAppSharing() {
    const shareWhatsApp = document.getElementById('share-whatsapp');

    if (shareWhatsApp) {
        shareWhatsApp.addEventListener('click', async () => {
            const text = encodeURIComponent('Check out my artwork created with Iván Guaderrama\'s AI Gallery!');
            const url = `https://wa.me/?text=${text}`;

            if (navigator.share) {
                try {
                    const response = await fetch(currentArtworkUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });

                    await navigator.share({
                        files: [file],
                        title: 'My AI Artwork',
                        text: 'Check out my artwork!'
                    });
                    return;
                } catch (error) {
                    console.log('Web Share failed, falling back to WhatsApp link');
                }
            }

            window.open(url, '_blank');
            setTimeout(() => downloadArtwork('artwork-whatsapp.png'), 500);
        });
    }
}

function setupFacebookSharing() {
    const shareFacebook = document.getElementById('share-facebook');

    if (shareFacebook) {
        shareFacebook.addEventListener('click', async () => {
            downloadArtwork('artwork-facebook.png');

            setTimeout(() => {
                const text = encodeURIComponent('Check out my artwork created with AI!');
                const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_CONFIG.appUrl)}&quote=${text}`;
                window.open(fbUrl, '_blank', 'width=600,height=400');
            }, 500);
        });
    }
}

function setupCopyLink() {
    const copyLink = document.getElementById('copy-link');

    if (copyLink) {
        copyLink.addEventListener('click', async () => {
            const copyStatus = document.getElementById('copy-status');

            try {
                await navigator.clipboard.writeText(APP_CONFIG.appUrl);
                if (copyStatus) {
                    copyStatus.textContent = 'Link copied!';
                    copyStatus.classList.add('text-green-500');
                    setTimeout(() => {
                        copyStatus.textContent = 'Click to copy';
                        copyStatus.classList.remove('text-green-500');
                    }, 2000);
                }
            } catch (error) {
                console.error('Failed to copy:', error);
                if (copyStatus) copyStatus.textContent = 'Failed to copy';
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

async function generateBeforeAfterCollage(originalUrl, artworkUrl) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        const originalImg = new Image();
        const artworkImg = new Image();

        let loadedCount = 0;
        const onImageLoad = () => {
            loadedCount++;
            if (loadedCount === 2) {
                // Background
                ctx.fillStyle = '#111418';
                ctx.fillRect(0, 0, 1080, 1080);

                // Draw original (left side)
                ctx.drawImage(originalImg, 40, 140, 480, 720);

                // Draw arrow
                ctx.fillStyle = '#1980e6';
                ctx.font = 'bold 60px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('→', 540, 520);

                // Draw artwork (right side)
                ctx.drawImage(artworkImg, 560, 140, 480, 720);

                // Add branding
                ctx.fillStyle = '#9dabb8';
                ctx.font = '18px "Spline Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Through the Vision of', 540, 920);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 28px "Spline Sans", sans-serif';
                ctx.fillText('Iván Guaderrama', 540, 955);

                resolve(canvas.toDataURL('image/png'));
            }
        };

        originalImg.onload = onImageLoad;
        artworkImg.onload = onImageLoad;
        originalImg.src = originalUrl;
        artworkImg.src = artworkUrl;
    });
}

async function generateInstagramStory(artworkUrl) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        const artworkImg = new Image();
        artworkImg.onload = () => {
            // Background with blurred artwork
            ctx.filter = 'blur(30px) brightness(0.4)';
            const scale = Math.max(1080 / artworkImg.width, 1920 / artworkImg.height);
            const scaledWidth = artworkImg.width * scale;
            const scaledHeight = artworkImg.height * scale;
            const offsetX = (1080 - scaledWidth) / 2;
            const offsetY = (1920 - scaledHeight) / 2;
            ctx.drawImage(artworkImg, offsetX, offsetY, scaledWidth, scaledHeight);

            // Main artwork centered
            ctx.filter = 'none';
            const artworkHeight = 1400;
            const artworkWidth = 1080;
            const artworkTop = 200;
            ctx.drawImage(artworkImg, 0, artworkTop, artworkWidth, artworkHeight);

            // Branding
            ctx.fillStyle = 'rgba(17, 20, 24, 0.8)';
            ctx.fillRect(0, 1700, 1080, 220);

            ctx.fillStyle = '#9dabb8';
            ctx.font = '24px "Spline Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Through the Vision of', 540, 1770);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px "Spline Sans", sans-serif';
            ctx.fillText('Iván Guaderrama', 540, 1820);

            // Decorative element
            ctx.strokeStyle = '#1980e6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(340, 1850);
            ctx.lineTo(740, 1850);
            ctx.stroke();

            resolve(canvas.toDataURL('image/png'));
        };
        artworkImg.src = artworkUrl;
    });
}

function resetCollageButton(btn) {
    btn.disabled = false;
    btn.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-[#1980e6] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
        </div>
        <div class="flex-1 text-left">
            <p class="text-white font-semibold">Before/After Collage</p>
            <p class="text-[#9dabb8] text-xs">Perfect for Instagram Post (1080x1080)</p>
        </div>
    `;
}

function resetStoryButton(btn) {
    btn.disabled = false;
    btn.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="2" width="10" height="20" rx="2" stroke="white" stroke-width="2" fill="none"/>
                <circle cx="12" cy="6" r="1.5" fill="white"/>
            </svg>
        </div>
        <div class="flex-1 text-left">
            <p class="text-white font-semibold">Instagram Story</p>
            <p class="text-[#9dabb8] text-xs">Optimized format (1080x1920)</p>
        </div>
    `;
}
