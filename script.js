document.addEventListener("DOMContentLoaded", () => {
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
    const cloudFunctionUrl = 'https://us-central1-ai-painter-app.cloudfunctions.net/api/generate';
    const fileUploadInput = document.getElementById("file-upload");

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
                    const data = await response.json();
                    const resultImageUrl = `data:image/png;base64,${data.imageBase64}`;
                    if (ui.resultImage) ui.resultImage.style.backgroundImage = `url(${resultImageUrl})`;
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
                    showScreen("limit");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "An unknown error occurred.");
                }
            } catch (error) {
                console.error("Error generating image:", error);
                alert(`An error occurred: ${error.message}`);
                showScreen("upload"); // Go back to upload screen on error
            }
        });
    }

    // --- Other Button Logic ---
    if (buttons.upload) buttons.upload.addEventListener("click", () => fileUploadInput.click());
    if (buttons.uploadZone) buttons.uploadZone.addEventListener("click", () => fileUploadInput.click());
    if (buttons.createAnother) buttons.createAnother.addEventListener("click", () => showScreen("upload"));

    // Initial state
    showScreen("login");
});