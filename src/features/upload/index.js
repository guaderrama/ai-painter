/**
 * Upload Feature Module
 * Handles image upload and AI processing
 */

import { auth, db, storage } from '../../shared/config/firebase.js';
import { firebaseConfig } from '../../shared/config/firebase.js';
import { API_ENDPOINTS } from '../../shared/config/api.js';
import { showScreen } from '../../shared/ui/screens.js';
import { showToast } from '../../shared/utils/toast.js';

// Processing state
let messageInterval = null;
let progressInterval = null;
let originalImageUrl = null;

const INSPIRATIONAL_MESSAGES = [
    "The art is the visible trace of the invisible soul...",
    "Every digital stroke captures the essence of your moment...",
    "Creativity is a divine gift in action...",
    "Your image is being reimagined with love and precision...",
    "Art speaks where words are unable to explain...",
    "Every masterpiece begins with a single vision...",
    "Transforming memories into timeless art..."
];

export function initUpload(onProcessingComplete) {
    const fileUploadInput = document.getElementById("file-upload");
    const uploadButton = document.getElementById("upload-button");
    const dropZone = document.getElementById("drop-zone");
    const createAnotherBtn = document.getElementById("create-another");

    if (uploadButton) {
        uploadButton.addEventListener("click", () => fileUploadInput?.click());
    }

    if (dropZone) {
        dropZone.addEventListener("click", () => fileUploadInput?.click());
    }

    if (createAnotherBtn) {
        createAnotherBtn.addEventListener("click", () => showScreen("upload"));
    }

    if (fileUploadInput) {
        fileUploadInput.addEventListener("change", async (event) => {
            await handleFileUpload(event, onProcessingComplete);
        });
    }
}

async function handleFileUpload(event, onProcessingComplete) {
    const file = event.target.files[0];
    const fileUploadInput = event.target;

    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in to generate images.");
        return;
    }

    // Validate credits before processing
    try {
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            alert("Please wait while we set up your account...");
            fileUploadInput.value = "";
            return;
        }

        const userCredits = userDoc.data().credits || 0;

        if (userCredits < 1) {
            showScreen("limit");
            fileUploadInput.value = "";
            return;
        }
    } catch (error) {
        console.error("Error checking credits:", error);
        alert("Error checking your credits. Please try again.");
        fileUploadInput.value = "";
        return;
    }

    showScreen("processing");
    startProcessingAnimation();

    try {
        const idToken = await user.getIdToken();

        // 1. Upload image to Firebase Storage
        const storageRef = storage.ref();
        const filename = `user_uploads/${user.uid}/${Date.now()}_${file.name}`;
        const imageRef = storageRef.child(filename);
        const uploadTask = imageRef.put(file);

        await uploadTask;
        const imageUrl = `gs://${firebaseConfig.storageBucket}/${filename}`;

        // 2. Send Storage URL to Cloud Function
        const response = await fetch(API_ENDPOINTS.generate, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: imageUrl }),
        });

        if (response.ok) {
            completeProcessing();
            await new Promise(resolve => setTimeout(resolve, 500));

            const data = await response.json();
            const resultImageUrl = `data:image/png;base64,${data.imageBase64}`;

            // Store original image for comparison
            originalImageUrl = URL.createObjectURL(file);

            // Set up result images
            const originalImg = document.getElementById('original-image');
            const transformedImg = document.getElementById('transformed-image');

            if (originalImg) originalImg.src = originalImageUrl;
            if (transformedImg) transformedImg.src = resultImageUrl;

            fileUploadInput.value = '';
            showScreen("result");

            // Apply reveal animation
            setTimeout(() => {
                if (transformedImg) {
                    transformedImg.classList.add('artwork-reveal');
                }
            }, 100);

            // Callback for gallery and sharing setup
            if (onProcessingComplete) {
                onProcessingComplete(originalImageUrl, resultImageUrl);
            }
        } else if (response.status === 402) {
            completeProcessing();
            await new Promise(resolve => setTimeout(resolve, 500));
            fileUploadInput.value = '';
            showScreen("limit");
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "An unknown error occurred.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        clearInterval(messageInterval);
        clearInterval(progressInterval);
        alert(`An error occurred: ${error.message}`);
        fileUploadInput.value = '';
        showScreen("upload");
    }
}

function startProcessingAnimation() {
    const inspirationalMsg = document.getElementById('inspirational-message');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const estimatedTime = document.getElementById('estimated-time');
    const loadingMessage = document.getElementById('loading-message');

    let currentMessageIndex = 0;
    let progress = 0;
    const startTime = Date.now();

    // Rotate inspirational messages
    messageInterval = setInterval(() => {
        currentMessageIndex = (currentMessageIndex + 1) % INSPIRATIONAL_MESSAGES.length;
        if (inspirationalMsg) {
            inspirationalMsg.style.opacity = '0';
            setTimeout(() => {
                inspirationalMsg.textContent = INSPIRATIONAL_MESSAGES[currentMessageIndex];
                inspirationalMsg.style.opacity = '1';
            }, 250);
        }
    }, 4000);

    // Animate progress bar
    progressInterval = setInterval(() => {
        progress += Math.random() * 3;
        if (progress > 90) progress = 90;

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const estimatedTotal = 15;
        const remaining = Math.max(0, estimatedTotal - elapsed);

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercentage) progressPercentage.textContent = `${Math.floor(progress)}%`;
        if (estimatedTime) estimatedTime.textContent = `~${remaining}s remaining`;

        if (loadingMessage) {
            if (progress < 30) loadingMessage.textContent = "Preparing the canvas...";
            else if (progress < 60) loadingMessage.textContent = "Analyzing your image...";
            else if (progress < 90) loadingMessage.textContent = "Applying artistic vision...";
            else loadingMessage.textContent = "Finalizing masterpiece...";
        }
    }, 200);
}

function completeProcessing() {
    clearInterval(messageInterval);
    clearInterval(progressInterval);

    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    const estimatedTime = document.getElementById('estimated-time');
    const loadingMessage = document.getElementById('loading-message');

    if (progressBar) progressBar.style.width = '100%';
    if (progressPercentage) progressPercentage.textContent = '100%';
    if (estimatedTime) estimatedTime.textContent = 'Complete!';
    if (loadingMessage) loadingMessage.textContent = 'Your artwork is ready!';
}

export function getOriginalImageUrl() {
    return originalImageUrl;
}
