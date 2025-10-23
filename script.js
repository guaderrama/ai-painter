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
        pricing: document.getElementById("pricing-screen"),
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

    // ==============================
    // QUICK WINS UX: PASSWORD & VALIDATION
    // ==============================
    
    // Password Strength Indicator
    function checkPasswordStrength(password) {
        const strengthBars = [
            document.getElementById('strength-bar-1'),
            document.getElementById('strength-bar-2'),
            document.getElementById('strength-bar-3'),
            document.getElementById('strength-bar-4')
        ];
        const strengthText = document.getElementById('password-strength-text');
        
        if (!password) {
            strengthBars.forEach(bar => bar.style.backgroundColor = '#293038');
            if (strengthText) strengthText.textContent = '';
            return;
        }
        
        let strength = 0;
        
        // Criteria
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Normalize to 0-4 scale
        strength = Math.min(4, Math.ceil(strength * 0.8));
        
        // Update bars
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'];
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        
        strengthBars.forEach((bar, index) => {
            if (index < strength) {
                bar.style.backgroundColor = colors[strength - 1];
            } else {
                bar.style.backgroundColor = '#293038';
            }
        });
        
        if (strengthText && strength > 0) {
            strengthText.textContent = labels[strength - 1];
            strengthText.style.color = colors[strength - 1];
        }
    }
    
    // Show/Hide Password Toggle
    function setupPasswordToggles() {
        const toggles = [
            {
                button: document.getElementById('toggle-login-password'),
                input: document.getElementById('login-password-input'),
                icon: document.getElementById('eye-icon-login')
            },
            {
                button: document.getElementById('toggle-signup-password'),
                input: document.getElementById('signup-password-input'),
                icon: document.getElementById('eye-icon-signup')
            },
            {
                button: document.getElementById('toggle-signup-confirm-password'),
                input: document.getElementById('signup-confirm-password-input'),
                icon: document.getElementById('eye-icon-signup-confirm')
            }
        ];
        
        toggles.forEach(({ button, input, icon }) => {
            if (button && input) {
                button.addEventListener('click', () => {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    
                    // Update icon
                    if (icon) {
                        if (isPassword) {
                            // Show "eye-slash" icon
                            icon.innerHTML = '<path d="M53.92 34.62L34.62 53.92C33.09 51.84 32 49.08 32 46C32 38.27 38.27 32 46 32C49.08 32 51.84 33.09 53.92 34.62ZM46 64C38.27 64 32 57.73 32 50C32 46.92 33.09 44.16 34.62 42.08L53.92 61.38C51.84 62.91 49.08 64 46 64ZM46 20C69 20 88 38 88 46C88 48.84 87.44 51.55 86.41 54L100.28 67.87C99.89 68.26 99.41 68.5 98.88 68.5C98.35 68.5 97.87 68.26 97.48 67.87L28.13 -1.48C27.74 -1.87 27.5 -2.35 27.5 -2.88C27.5 -3.41 27.74 -3.89 28.13 -4.28C28.91 -5.06 30.19 -5.06 30.97 -4.28L44.84 9.59C45.22 9.53 45.61 9.5 46 9.5C50.97 9.5 55 13.53 55 18.5C55 18.89 54.97 19.28 54.91 19.66L68.78 33.53C70.31 35.06 72 36.38 73.84 37.47L86.41 54C87.44 51.55 88 48.84 88 46C88 38 69 20 46 20Z"/>';
                        } else {
                            // Show "eye" icon (original)
                            icon.innerHTML = '<path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>';
                        }
                    }
                });
            }
        });
    }
    
    // Email Validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Inline Form Validation for Signup
    function setupInlineValidation() {
        const signupEmailInput = document.getElementById('signup-email-input');
        const signupEmailError = document.getElementById('signup-email-error');
        const signupPasswordInput = document.getElementById('signup-password-input');
        const signupConfirmPasswordInput = document.getElementById('signup-confirm-password-input');
        const signupConfirmPasswordError = document.getElementById('signup-confirm-password-error');
        
        // Email validation
        if (signupEmailInput && signupEmailError) {
            signupEmailInput.addEventListener('blur', () => {
                const email = signupEmailInput.value.trim();
                if (email && !isValidEmail(email)) {
                    signupEmailError.textContent = 'Please enter a valid email address';
                } else {
                    signupEmailError.textContent = '';
                }
            });
            
            signupEmailInput.addEventListener('input', () => {
                if (signupEmailError.textContent && isValidEmail(signupEmailInput.value.trim())) {
                    signupEmailError.textContent = '';
                }
            });
        }
        
        // Password strength tracking
        if (signupPasswordInput) {
            signupPasswordInput.addEventListener('input', () => {
                checkPasswordStrength(signupPasswordInput.value);
            });
        }
        
        // Confirm password validation
        if (signupConfirmPasswordInput && signupPasswordInput && signupConfirmPasswordError) {
            signupConfirmPasswordInput.addEventListener('input', () => {
                const password = signupPasswordInput.value;
                const confirmPassword = signupConfirmPasswordInput.value;
                
                if (confirmPassword && password !== confirmPassword) {
                    signupConfirmPasswordError.textContent = 'Passwords do not match';
                } else {
                    signupConfirmPasswordError.textContent = '';
                }
            });
            
            signupPasswordInput.addEventListener('input', () => {
                const password = signupPasswordInput.value;
                const confirmPassword = signupConfirmPasswordInput.value;
                
                if (confirmPassword && password !== confirmPassword) {
                    signupConfirmPasswordError.textContent = 'Passwords do not match';
                } else {
                    signupConfirmPasswordError.textContent = '';
                }
            });
        }
    }
    
    // Toast Notification System
    function showToast(message, type = 'success') {
        // Remove existing toasts
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification fixed bottom-4 right-4 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 transition-all duration-300 transform translate-y-0';
        
        const colors = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            info: 'bg-blue-600 text-white'
        };
        
        const icons = {
            success: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
            error: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
            info: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        };
        
        toast.className += ' ' + colors[type];
        toast.innerHTML = `
            ${icons[type]}
            <span class="font-semibold">${message}</span>
        `;
        
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
    
    // Initialize all UX improvements
    setupPasswordToggles();
    setupInlineValidation();

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

        userRef.onSnapshot(async doc => {
            if (doc.exists) {
                const userData = doc.data();
                if (ui.userCredits) {
                    ui.userCredits.textContent = `${userData.credits || 0} credits remaining`;
                }
                // Decide which screen to show based on credits
                if ((userData.credits || 0) > 0) {
                    showScreen("upload");
                } else {
                    showScreen("limit");
                }
            } else {
                try {
                    await userRef.set(
                        {
                            credits: 3,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        },
                        { merge: true }
                    );
                    if (ui.userCredits) {
                        ui.userCredits.textContent = "3 credits remaining";
                    }
                    showScreen("upload");
                } catch (createErr) {
                    console.error("Error creating initial user document:", createErr);
                    alert("We couldn't finish setting up your account. Please refresh and try again.");
                    showScreen("login");
                }
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

            // ✅ VALIDAR CRÉDITOS ANTES DE PROCESAR
            try {
                const userRef = db.collection("users").doc(user.uid);
                const userDoc = await userRef.get();
                
                if (!userDoc.exists) {
                    alert("Please wait while we set up your account...");
                    fileUploadInput.value = ""; // Reset input
                    return;
                }
                
                const userCredits = userDoc.data().credits || 0;
                
                if (userCredits < 1) {
                    // No tiene créditos, mostrar pantalla de límite
                    showScreen("limit");
                    fileUploadInput.value = ""; // Reset input
                    return;
                }
            } catch (error) {
                console.error("Error checking credits:", error);
                alert("Error checking your credits. Please try again.");
                fileUploadInput.value = ""; // Reset input
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
                    
                    // Setup download button with toast confirmation
                    if (buttons.downloadArtwork) {
                        buttons.downloadArtwork.onclick = () => {
                            const a = document.createElement('a');
                            a.href = resultImageUrl;
                            a.download = `artwork-${Date.now()}.png`;
                            a.click();
                            
                            // Show success toast
                            showToast('✓ Artwork downloaded!', 'success');
                        };
                    }
                    
                    showScreen("result");
                    
                    // 🎨 Apply reveal animation to transformed image
                    setTimeout(() => {
                        if (transformedImg) {
                            transformedImg.classList.add('artwork-reveal');
                        }
                    }, 100);
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
    // ENHANCED SHARING - COLLAGES & STORIES
    // ==============================
    
    // Generate Before/After Collage
    async function generateBeforeAfterCollage(originalUrl, artworkUrl) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            
            // Load both images
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
                    
                    // Add branding at bottom
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
    
    // Generate Instagram Story format
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
                
                // Main artwork centered (no blur)
                ctx.filter = 'none';
                const artworkHeight = 1400;
                const artworkWidth = 1080;
                const artworkTop = 200;
                ctx.drawImage(artworkImg, 0, artworkTop, artworkWidth, artworkHeight);
                
                // Branding at bottom
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
        
        // Generate Before/After Collage
        const generateCollageBtn = document.getElementById('generate-collage');
        if (generateCollageBtn && originalImageUrl) {
            generateCollageBtn.addEventListener('click', async () => {
                try {
                    // Show loading state
                    generateCollageBtn.disabled = true;
                    generateCollageBtn.innerHTML = '<span>Generating...</span>';
                    
                    // Generate collage
                    const collageDataUrl = await generateBeforeAfterCollage(originalImageUrl, currentArtworkUrl);
                    
                    // Download the collage
                    const a = document.createElement('a');
                    a.href = collageDataUrl;
                    a.download = `before-after-collage-${Date.now()}.png`;
                    a.click();
                    
                    showToast('✓ Collage generated and downloaded!', 'success');
                    
                    // Reset button
                    generateCollageBtn.disabled = false;
                    generateCollageBtn.innerHTML = `
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
                } catch (error) {
                    console.error('Error generating collage:', error);
                    showToast('Failed to generate collage', 'error');
                    generateCollageBtn.disabled = false;
                }
            });
        }
        
        // Generate Instagram Story
        const generateStoryBtn = document.getElementById('generate-story');
        if (generateStoryBtn) {
            generateStoryBtn.addEventListener('click', async () => {
                try {
                    // Show loading state
                    generateStoryBtn.disabled = true;
                    generateStoryBtn.innerHTML = '<span>Generating...</span>';
                    
                    // Generate story format
                    const storyDataUrl = await generateInstagramStory(currentArtworkUrl);
                    
                    // Download the story
                    const a = document.createElement('a');
                    a.href = storyDataUrl;
                    a.download = `instagram-story-${Date.now()}.png`;
                    a.click();
                    
                    showToast('✓ Instagram Story generated!', 'success');
                    
                    // Reset button
                    generateStoryBtn.disabled = false;
                    generateStoryBtn.innerHTML = `
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
                } catch (error) {
                    console.error('Error generating story:', error);
                    showToast('Failed to generate story', 'error');
                    generateStoryBtn.disabled = false;
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

    // ==============================
    // STRIPE PAYMENT LOGIC
    // ==============================
    
    // ⚠️ IMPORTANT: Replace these with your actual Price IDs from Stripe Dashboard
    const STRIPE_PRICES = {
        starter: 'price_1SJ0UWGdnHfsTKebUDHcFzL3',
        popular: 'price_1SJ0eSGdnHfsTKeb3RErkfWa',
        pro: 'price_REPLACE_WITH_YOUR_PRO_PRICE_ID',  // TODO: Crear Pro Pack ($29.99)
        artist: 'price_REPLACE_WITH_YOUR_ARTIST_PRICE_ID',  // TODO: Crear Artist Pack ($69.99)
    };
    
    // ⚠️ IMPORTANT: Replace with your actual Publishable Key from Stripe
    // Get it from: https://dashboard.stripe.com/test/apikeys
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_51N4Hx4GdnHfsTKebYwuwrVG9P5Eu6b2G7tnoECAFcomtCNyFCF0IfnuUeWsMPwbBkZbDrvgpuEw8JePcVuHait5W00022FKcge';
    
    // Initialize Stripe (will fail gracefully if key not set yet)
    let stripe = null;
    try {
        if (STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.includes('REPLACE')) {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        } else {
            console.warn('⚠️ Stripe not initialized: Please add your Publishable Key to script.js');
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
    
    // Pricing screen navigation
    const closePricingBtn = document.getElementById('close-pricing');
    const buyMoreCreditsBtn = document.getElementById('buy-more-credits-limit');
    const buyCreditsButtons = document.querySelectorAll('.buy-credits-btn');
    
    // Open pricing screen from limit screen
    if (buyMoreCreditsBtn) {
        buyMoreCreditsBtn.addEventListener('click', () => {
            showScreen('pricing');
        });
    }
    
    // Close pricing screen
    if (closePricingBtn) {
        closePricingBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user) {
                // Check credits to decide where to go back
                const userRef = db.collection('users').doc(user.uid);
                userRef.get().then(doc => {
                    if (doc.exists) {
                        const credits = doc.data().credits || 0;
                        showScreen(credits > 0 ? 'upload' : 'limit');
                    } else {
                        showScreen('upload');
                    }
                });
            } else {
                showScreen('login');
            }
        });
    }
    
    // Handle buy credits button clicks
    if (buyCreditsButtons) {
        buyCreditsButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const plan = this.getAttribute('data-plan');
                const priceId = STRIPE_PRICES[plan];
                
                // Validate user is logged in
                const user = auth.currentUser;
                if (!user) {
                    alert('Please sign in to purchase credits.');
                    showScreen('login');
                    return;
                }
                
                // Validate Stripe is initialized
                if (!stripe) {
                    alert('Payment system not configured. Please contact support.');
                    console.error('Stripe not initialized. Please add your Publishable Key.');
                    return;
                }
                
                // Validate price ID
                if (!priceId || priceId.includes('REPLACE')) {
                    alert('Payment system not configured. Please contact support.');
                    console.error(`Price ID for ${plan} not configured. Please add your Price IDs from Stripe Dashboard.`);
                    return;
                }
                
                try {
                    // Disable button
                    this.disabled = true;
                    this.textContent = 'Processing...';
                    
                    // Create checkout session in Firestore
                    // The Stripe extension will listen to this and create the Stripe session
                    const checkoutSessionRef = await db
                        .collection('customers')
                        .doc(user.uid)
                        .collection('checkout_sessions')
                        .add({
                            mode: 'payment',  // One-time payment, not subscription
                            price: priceId,
                            success_url: window.location.origin,
                            cancel_url: window.location.origin,
                        });
                    
                    // Wait for the Stripe extension to create the session
                    checkoutSessionRef.onSnapshot(async (snap) => {
                        const { error, sessionId } = snap.data();
                        
                        if (error) {
                            // Show error
                            alert(`An error occurred: ${error.message}`);
                            this.disabled = false;
                            this.textContent = 'Buy Now';
                            return;
                        }
                        
                        if (sessionId) {
                            // Redirect to Stripe Checkout
                            const { error: stripeError } = await stripe.redirectToCheckout({
                                sessionId
                            });
                            
                            if (stripeError) {
                                alert(`Checkout error: ${stripeError.message}`);
                                this.disabled = false;
                                this.textContent = 'Buy Now';
                            }
                        }
                    });
                    
                } catch (error) {
                    console.error('Error creating checkout session:', error);
                    alert(`An error occurred: ${error.message}`);
                    this.disabled = false;
                    this.textContent = 'Buy Now';
                }
            });
        });
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
