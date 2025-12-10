/**
 * Auth Feature Module
 * Handles authentication (Google, Email/Password)
 */

import { auth, db, googleProvider } from '../../shared/config/firebase.js';
import { showScreen } from '../../shared/ui/screens.js';
import { APP_CONFIG, API_BASE_URL } from '../../shared/config/api.js';
import { loadUserHistory } from '../history/index.js';

// UI Elements
let ui = {};
// Store unsubscribe function to prevent memory leaks
let userSnapshotUnsubscribe = null;

export function initAuth() {
    // Cache UI elements
    ui = {
        loginEmailInput: document.getElementById("login-email-input"),
        loginPasswordInput: document.getElementById("login-password-input"),
        loginErrorMessage: document.getElementById("login-error-message"),
        signupEmailInput: document.getElementById("signup-email-input"),
        signupPasswordInput: document.getElementById("signup-password-input"),
        signupConfirmPasswordInput: document.getElementById("signup-confirm-password-input"),
        signupErrorMessage: document.getElementById("signup-error-message"),
        userGreeting: document.getElementById("user-greeting"),
        userCredits: document.getElementById("user-credits"),
    };

    setupAuthButtons();
    setupAuthStateObserver();
}

function setupAuthButtons() {
    const buttons = {
        loginGoogle: document.getElementById("login-google"),
        loginEmailMain: document.getElementById("login-email-main"),
        backToMainLogin: document.getElementById("back-to-main-login"),
        emailLogin: document.getElementById("email-login-button"),
        goToSignup: document.getElementById("go-to-signup"),
        emailSignup: document.getElementById("email-signup-button"),
        goToLogin: document.getElementById("go-to-login"),
        goToLoginFromSignup: document.getElementById("go-to-login-from-signup"),
        logout: document.getElementById("logout-button"),
    };

    // Google Login
    if (buttons.loginGoogle) {
        buttons.loginGoogle.addEventListener("click", () => {
            auth.signInWithPopup(googleProvider).catch(error =>
                alert(`Google Sign-In Error: ${error.message}`)
            );
        });
    }

    // Navigation between auth screens
    if (buttons.loginEmailMain) {
        buttons.loginEmailMain.addEventListener("click", () => showScreen("emailLogin"));
    }
    if (buttons.backToMainLogin) {
        buttons.backToMainLogin.addEventListener("click", () => showScreen("login"));
    }
    if (buttons.goToSignup) {
        buttons.goToSignup.addEventListener("click", (e) => {
            e.preventDefault();
            showScreen("emailSignup");
        });
    }
    if (buttons.goToLogin) {
        buttons.goToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            showScreen("emailLogin");
        });
    }
    if (buttons.goToLoginFromSignup) {
        buttons.goToLoginFromSignup.addEventListener("click", () => showScreen("emailLogin"));
    }

    // Email Login
    if (buttons.emailLogin) {
        buttons.emailLogin.addEventListener("click", handleEmailLogin);
    }

    // Email Signup
    if (buttons.emailSignup) {
        buttons.emailSignup.addEventListener("click", handleEmailSignup);
    }

    // Logout
    if (buttons.logout) {
        buttons.logout.addEventListener("click", () => {
            cleanupAuth(); // Cleanup listeners before signing out
            auth.signOut();
        });
    }
}

function handleEmailLogin() {
    const email = ui.loginEmailInput?.value;
    const password = ui.loginPasswordInput?.value;

    if (!email || !password) {
        if (ui.loginErrorMessage) {
            ui.loginErrorMessage.textContent = "Please enter both email and password.";
        }
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            if (ui.loginErrorMessage) {
                ui.loginErrorMessage.textContent = error.message;
            }
        });
}

function handleEmailSignup() {
    const email = ui.signupEmailInput?.value;
    const password = ui.signupPasswordInput?.value;
    const confirmPassword = ui.signupConfirmPasswordInput?.value;

    if (!email || !password || !confirmPassword) {
        if (ui.signupErrorMessage) {
            ui.signupErrorMessage.textContent = "Please fill in all fields.";
        }
        return;
    }

    if (password !== confirmPassword) {
        if (ui.signupErrorMessage) {
            ui.signupErrorMessage.textContent = "Passwords do not match.";
        }
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => {
            if (ui.signupErrorMessage) {
                ui.signupErrorMessage.textContent = error.message;
            }
        });
}

function setupAuthStateObserver() {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in:", user.email);
            if (ui.loginErrorMessage) ui.loginErrorMessage.textContent = "";
            if (ui.signupErrorMessage) ui.signupErrorMessage.textContent = "";
            showScreen("upload");
            updateUserInfo(user);
        } else {
            console.log("User is signed out.");
            showScreen("login");
        }
    });
}

export function updateUserInfo(user) {
    if (ui.userGreeting) {
        ui.userGreeting.textContent = `Hello, ${user.email}`;
    }

    // Cleanup previous listener to prevent memory leaks
    if (userSnapshotUnsubscribe) {
        userSnapshotUnsubscribe();
        userSnapshotUnsubscribe = null;
    }

    const userRef = db.collection("users").doc(user.uid);

    userSnapshotUnsubscribe = userRef.onSnapshot(async doc => {
        if (doc.exists) {
            const userData = doc.data();
            if (ui.userCredits) {
                ui.userCredits.textContent = `${userData.credits || 0} credits remaining`;
            }
            // Decide which screen to show based on credits
            if ((userData.credits || 0) > 0) {
                showScreen("upload");
                // Load user's artwork history
                loadUserHistory(user.uid);
            } else {
                showScreen("limit");
            }
        } else {
            // User document doesn't exist - call Cloud Function to create it
            // This bypasses Firestore security rules that block direct credit writes
            try {
                console.log("User document not found, calling ensure-user endpoint...");
                const idToken = await user.getIdToken();

                const response = await fetch(`${API_BASE_URL}/ensure-user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log("User initialized with credits:", result.credits);

                if (ui.userCredits) {
                    ui.userCredits.textContent = `${result.credits} credits remaining`;
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
        showScreen("login");
    });
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function getUserCredits(userId) {
    return db.collection("users").doc(userId).get();
}

/**
 * Cleanup auth listeners to prevent memory leaks
 */
export function cleanupAuth() {
    if (userSnapshotUnsubscribe) {
        userSnapshotUnsubscribe();
        userSnapshotUnsubscribe = null;
    }
}
