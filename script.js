document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // WELCOME/ONBOARDING LOGIC
    // ==============================
    
    let currentSlide = 1;
    const totalSlides = 4;
    
    // Check if user has seen welcome screen
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    function showWelcomeSlide(slideNumber) {
        // Hide all slides
        document.querySelectorAll('.welcome-slide').forEach(slide => {
            slide.classList.remove('active', 'exiting');
        });
        
        // Show current slide
        const currentSlideElement = document.querySelector(`.welcome-slide[data-slide="${slideNumber}"]`);
        if (currentSlideElement) {
            currentSlideElement.classList.add('active');
        }
        
        // Update dots
        document.querySelectorAll('.welcome-dot').forEach(dot => {
            dot.classList.remove('active');
        });
        const currentDot = document.querySelector(`.welcome-dot[data-dot="${slideNumber}"]`);
        if (currentDot) {
            currentDot.classList.add('active');
        }
        
        // Update buttons
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        
        if (slideNumber === 1) {
            prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
            prevBtn.disabled = true;
        } else {
            prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            prevBtn.disabled = false;
        }
        
        if (slideNumber === totalSlides) {
            nextBtn.textContent = "Get Started";
        } else {
            nextBtn.textContent = "Next";
        }
    }
    
    function completeWelcome() {
        localStorage.setItem('hasSeenWelcome', 'true');
        showScreen('login');
    }
    
    // Welcome navigation event listeners
    const nextSlideBtn = document.getElementById('next-slide');
    const prevSlideBtn = document.getElementById('prev-slide');
    const skipBtn = document.getElementById('skip-welcome');
    
    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides) {
                currentSlide++;
                showWelcomeSlide(currentSlide);
            } else {
                // Last slide - go to login
                completeWelcome();
            }
        });
    }
    
    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            if (currentSlide > 1) {
                currentSlide--;
                showWelcomeSlide(currentSlide);
            }
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            completeWelcome();
        });
    }
    
    // ==============================
    // FIREBASE CONFIGURATION
    // ==============================
    
    const firebaseConfig = {
        apiKey: "AIzaSyDZCMT5thdYHncvaOE5xkElcklOR170_BA",
        authDomain: "ai-painter-app.firebaseapp.com",
        projectId: "ai-painter-app",
                storageBucket: "ai-painter-app-uploads-2025",
        messagingSenderId: "255643153942",
        appId: "1:255643153942:web:3cfbb628ad25e1d799a737",
        measurementId: "G-CF49C1YKNX"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage(); // Initialize Firebase Storage

    // --- DOM Elements ---
    const screens = {
        welcome: document.getElementById("welcome-screen"),
        login: document.getElementById("login-screen"),
        emailLogin: document.getElementById("email-login-screen"),
        emailSignup: document.getElementById("email-signup-screen"),
        upload: document.getElementById("upload-screen"),
        processing: document.getElementById("processing-screen"),
        result: document.getElementById("result-screen"),
        limit: document.getElementById("limit-screen"),
    };

    const buttons = {
        loginGoogle: document.getElementById("login-google"),
        loginEmailMain: document.getElementById("login-email-main"),
        backToMainLogin: document.getElementById("back-to-main-login"),
        emailLogin: document.getElementById("email-login-button"),
        goToSignup: document.getElementById("go-to-signup"),
        emailSignup: document.getElementById("email-signup-button"),
        goToLogin: document.getElementById("go-to-login"),
        logout: document.getElementById("logout-button"),
        upload: document.getElementById("upload-button"),
        uploadZone: document.getElementById("drop-zone"),
        createAnother: document.getElementById("create-another"),
        downloadArtwork: document.getElementById("download-artwork"),
    };
    
    const ui = {
        userGreeting: document.getElementById("user-greeting"),
        userCredits: document.getElementById("user-credits"),
        resultImage: document.getElementById("result-image"),
        // Login screen
        loginEmailInput: document.getElementById("login-email-input"),
        loginPasswordInput: document.getElementById("login-password-input"),
        loginErrorMessage: document.getElementById("login-error-message"),
        // Signup screen
        signupEmailInput: document.getElementById("signup-email-input"),
        signupPasswordInput: document.getElementById("signup-password-input"),
        signupConfirmPasswordInput: document.getElementById("signup-confirm-password-input"),
        signupErrorMessage: document.getElementById("signup-error-message"),
    };

    // --- Screen Navigation ---
    function showScreen(screenId) {
        console.log(`%c[SCREEN] Attempting to show: ${screenId}`, 'color: blue; font-weight: bold;');
        // Hide all screens first
        for (let screenKey in screens) {
            if (screens[screenKey]) {
                // console.log(`[SCREEN] Hiding: ${screenKey}`);
                screens[screenKey].classList.remove('active');
            }
        }
        // Show the requested screen
        if (screens[screenId]) {
            console.log(`%c[SCREEN] Successfully showing: ${screenId}`, 'color: green;');
            screens[screenId].classList.add('active');
        } else {
            console.error(`[SCREEN] ERROR: Screen element for "${screenId}" not found in DOM!`);
        }
    }

    // --- Firebase Auth ---
    const provider = new firebase.auth.GoogleAuthProvider();

    if (buttons.loginGoogle) {
        buttons.loginGoogle.addEventListener("click", () => {
            auth.signInWithPopup(provider).catch(error => alert(`Google Sign-In Error: ${error.message}`));
        });
    }

    if (buttons.loginEmailMain) buttons.loginEmailMain.addEventListener("click", () => showScreen("emailLogin"));
    if (buttons.backToMainLogin) buttons.backToMainLogin.addEventListener("click", () => showScreen("login"));
    if (buttons.goToSignup) buttons.goToSignup.addEventListener("click", (e) => { e.preventDefault(); showScreen("emailSignup"); });
    if (buttons.goToLogin) buttons.goToLogin.addEventListener("click", (e) => { e.preventDefault(); showScreen("emailLogin"); });

    // Email Login
    if (buttons.emailLogin) {
        buttons.emailLogin.addEventListener("click", () => {
            const email = ui.loginEmailInput.value;
            const password = ui.loginPasswordInput.value;
            if (!email || !password) {
                ui.loginErrorMessage.textContent = "Please enter both email and password.";
                return;
            }
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    if (ui.loginErrorMessage) ui.loginErrorMessage.textContent = error.message;
                });
        });
    }

    // Email Signup
    if (buttons.emailSignup) {
        buttons.emailSignup.addEventListener("click", () => {
            const email = ui.signupEmailInput.value;
            const password = ui.signupPasswordInput.value;
            const confirmPassword = ui.signupConfirmPasswordInput.value;

            if (!email || !password || !confirmPassword) {
                if (ui.signupErrorMessage) ui.signupErrorMessage.textContent = "Please fill in all fields.";
                return;
            }
            if (password !== confirmPassword) {
                if (ui.signupErrorMessage) ui.signupErrorMessage.textContent = "Passwords do not match.";
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .catch(error => {
                    if (ui.signupErrorMessage) ui.signupErrorMessage.textContent = error.message;
                });
        });
    }

    if (buttons.logout) {
        buttons.logout.addEventListener("click", () => {
            auth.signOut();
        });
    }

    // Auth state observer
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in:", user.email);
            if(ui.loginErrorMessage) ui.loginErrorMessage.textContent = ""; 
            if(ui.signupErrorMessage) ui.signupErrorMessage.textContent = "";
            showScreen("upload");
            updateUserInfo(user);
        } else {
            console.log("User is signed out.");
            showScreen("login");
        }
    });

    // --- Firestore & UI Updates ---
    function updateUserInfo(user) {
        if (ui.userGreeting) ui.userGreeting.textContent = `Hello, ${user.email}`;
        const userRef = db.collection("users").doc(user.uid);

        userRef.onSnapshot(doc => {
            if (doc.exists) {
                const userData = doc.data();
                if (ui.userCredits) {
                    ui.userCredits.textContent = `${userData.credits || 0} credits remaining`;
                }
                // Decide which screen to show based on credits
                if (userData.credits > 0) {
                    showScreen("upload");
                } else {
                    showScreen("limit");
                }
            } else {
                // This case happens for a new user before the backend function creates their document
                console.log("No user document found, should be created by backend function.");
                // You might want to show a loading or waiting screen here
            }
        }, err => {
            console.error("Error fetching user data:", err);
            alert("Error connecting to the database. Please try again later.");
            showScreen("login"); // On error, send back to login
        });
    }

    // --- Image Generation ---
    const cloudFunctionUrl = 'https://api-255643153942.us-central1.run.app/generate';
    const fileUploadInput = document.getElementById("file-upload");
    
    // Inspirational messages for processing screen
    const inspirationalMessages = [
        "The art is the visible trace of the invisible soul...",
        "Every digital stroke captures the essence of your moment...",
        "Creativity is a divine gift in action...",
        "Your image is being reimagined with love and precision...",
        "Art speaks where words are unable to explain...",
        "Every masterpiece begins with a single vision...",
        "Transforming memories into timeless art..."
    ];
    
    let messageInterval;
    let progressInterval;
    let originalImageUrl = null;
    
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
            currentMessageIndex = (currentMessageIndex + 1) % inspirationalMessages.length;
            if (inspirationalMsg) {
                inspirationalMsg.style.opacity = '0';
                setTimeout(() => {
                    inspirationalMsg.textContent = inspirationalMessages[currentMessageIndex];
                    inspirationalMsg.style.opacity = '1';
                }, 250);
            }
        }, 4000);
        
        // Animate progress bar
        progressInterval = setInterval(() => {
            progress += Math.random() * 3;
            if (progress > 90) progress = 90; // Stop at 90% until real completion
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const estimatedTotal = 15; // seconds
            const remaining = Math.max(0, estimatedTotal - elapsed);
            
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercentage) progressPercentage.textContent = `${Math.floor(progress)}%`;
            if (estimatedTime) estimatedTime.textContent = `~${remaining}s remaining`;
            
            // Update loading message
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

    if (fileUploadInput) {
        fileUploadInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const user = auth.currentUser;
            if (!user) {
                alert("Please sign in to generate images.");
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

                // Wait for upload to complete
                await uploadTask;
                const imageUrl = `gs://${firebaseConfig.storageBucket}/${filename}`; // Get gs:// URL

                // 2. Send Storage URL to Cloud Function
                const response = await fetch(cloudFunctionUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${idToken}`,
                        "Content-Type": "application/json", // Specify JSON content type
                    },
                    body: JSON.stringify({ imageUrl: imageUrl }), // Send JSON body with imageUrl
                });

                if (response.ok) {
                    completeProcessing();
                    
                    // Wait a moment to show completion
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const data = await response.json();
                    const resultImageUrl = `data:image/png;base64,${data.imageBase64}`;
                    
                    // Store both images for comparison
                    originalImageUrl = URL.createObjectURL(file);
                    
                    // Set up Before/After comparison
                    const originalImg = document.getElementById('original-image');
                    const transformedImg = document.getElementById('transformed-image');
                    
                    if (originalImg) originalImg.src = originalImageUrl;
                    if (transformedImg) transformedImg.src = resultImageUrl;
                    
                    // Setup comparison controls
                    setupBeforeAfterComparison(originalImageUrl, resultImageUrl);
                    
                    // Setup social sharing
                    setupSocialSharing(resultImageUrl);
                    
                    // Setup download button
                    if (buttons.downloadArtwork) {
                        buttons.downloadArtwork.onclick = () => {
                            const a = document.createElement('a');
                            a.href = resultImageUrl;
                            a.download = 'artwork.png';
                            a.click();
                        };
                    }
                    
                    showScreen("result");
                } else if (response.status === 402) {
                    completeProcessing();
                    await new Promise(resolve => setTimeout(resolve, 500));
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
                showScreen("upload"); // Go back to upload screen on error
            }
        });
    }

    // ==============================
    // BEFORE/AFTER COMPARISON LOGIC
    // ==============================
    
    function setupBeforeAfterComparison(originalUrl, transformedUrl) {
        const showTransformedBtn = document.getElementById('show-transformed');
        const showOriginalBtn = document.getElementById('show-original');
        const showSliderBtn = document.getElementById('show-slider');
        const sliderHandle = document.getElementById('slider-handle');
        const transformedContainer = document.getElementById('transformed-container');
        const comparisonContainer = document.getElementById('comparison-container');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        let isDragging = false;
        
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
        
        // Event listeners for slider
        if (sliderHandle) {
            sliderHandle.addEventListener('mousedown', () => isDragging = true);
            document.addEventListener('mouseup', () => isDragging = false);
            document.addEventListener('mousemove', handleSliderMove);
            
            // Touch events
            sliderHandle.addEventListener('touchstart', () => isDragging = true);
            document.addEventListener('touchend', () => isDragging = false);
            document.addEventListener('touchmove', handleSliderMove);
        }
        
        // Fullscreen functionality
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
        
        // Initialize with transformed view
        showTransformed();
    }

    // ==============================
    // SOCIAL SHARING LOGIC
    // ==============================
    
    let currentArtworkUrl = null;
    
    function setupSocialSharing(artworkDataUrl) {
        currentArtworkUrl = artworkDataUrl;
        
        const shareMenuBtn = document.getElementById('share-menu-btn');
        const shareOptions = document.getElementById('share-options');
        const shareInstagram = document.getElementById('share-instagram');
        const shareWhatsApp = document.getElementById('share-whatsapp');
        const shareFacebook = document.getElementById('share-facebook');
        const copyLink = document.getElementById('copy-link');
        
        // Toggle share menu
        if (shareMenuBtn) {
            shareMenuBtn.addEventListener('click', () => {
                if (shareOptions) {
                    shareOptions.classList.toggle('hidden');
                    shareOptions.classList.toggle('flex');
                }
            });
        }
        
        // Instagram Stories sharing
        if (shareInstagram) {
            shareInstagram.addEventListener('click', async () => {
                try {
                    // Convert to blob
                    const response = await fetch(artworkDataUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'artwork.png', { type: 'image/png' });
                    
                    // Use Web Share API if available (best for mobile)
                    if (navigator.share && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork',
                            text: 'Check out my artwork created with Iván Guaderrama\'s AI Gallery!'
                        });
                    } else {
                        // Fallback: download the image
                        const a = document.createElement('a');
                        a.href = artworkDataUrl;
                        a.download = 'artwork-instagram-story.png';
                        a.click();
                        alert('Image downloaded! Open Instagram and upload it as a story.');
                    }
                } catch (error) {
                    console.error('Error sharing to Instagram:', error);
                    // Fallback to download
                    const a = document.createElement('a');
                    a.href = artworkDataUrl;
                    a.download = 'artwork-instagram.png';
                    a.click();
                }
            });
        }
        
        // WhatsApp sharing
        if (shareWhatsApp) {
            shareWhatsApp.addEventListener('click', async () => {
                const text = encodeURIComponent('Check out my artwork created with Iván Guaderrama\'s AI Gallery! 🎨✨');
                const url = `https://wa.me/?text=${text}`;
                
                // On mobile, try to use Web Share API first
                if (navigator.share) {
                    try {
                        const response = await fetch(artworkDataUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'artwork.png', { type: 'image/png' });
                        
                        await navigator.share({
                            files: [file],
                            title: 'My AI Artwork',
                            text: 'Check out my artwork! 🎨'
                        });
                        return;
                    } catch (error) {
                        console.log('Web Share failed, falling back to WhatsApp link');
                    }
                }
                
                // Fallback: open WhatsApp with text
                window.open(url, '_blank');
                
                // Also download image
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = artworkDataUrl;
                    a.download = 'artwork-whatsapp.png';
                    a.click();
                }, 500);
            });
        }
        
        // Facebook sharing
        if (shareFacebook) {
            shareFacebook.addEventListener('click', async () => {
                // Facebook doesn't allow direct image sharing via URL parameters
                // Best approach: download image and prompt user
                const a = document.createElement('a');
                a.href = artworkDataUrl;
                a.download = 'artwork-facebook.png';
                a.click();
                
                // Open Facebook in new tab with text
                setTimeout(() => {
                    const text = encodeURIComponent('Check out my artwork created with AI! 🎨✨');
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://ai-painter-app.web.app')}&quote=${text}`;
                    window.open(fbUrl, '_blank', 'width=600,height=400');
                }, 500);
            });
        }
        
        // Copy link functionality
        if (copyLink) {
            copyLink.addEventListener('click', async () => {
                const copyStatus = document.getElementById('copy-status');
                const appUrl = 'https://ai-painter-app.web.app';
                
                try {
                    await navigator.clipboard.writeText(appUrl);
                    if (copyStatus) {
                        copyStatus.textContent = '✓ Link copied!';
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

    // --- Other Button Logic ---
    if (buttons.upload) buttons.upload.addEventListener("click", () => fileUploadInput.click());
    if (buttons.uploadZone) buttons.uploadZone.addEventListener("click", () => fileUploadInput.click());
    if (buttons.createAnother) buttons.createAnother.addEventListener("click", () => showScreen("upload"));

    // Initial state - Show welcome if not seen, otherwise login
    if (!hasSeenWelcome) {
        showScreen("welcome");
        showWelcomeSlide(1);
    } else {
        showScreen("login");
    }
});
