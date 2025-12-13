/**
 * Auth Feature Module
 * Handles email authentication with unified Sign In / Sign Up tabs
 */

import { auth, db } from '../../shared/config/firebase.js';
import { showScreen } from '../../shared/ui/screens.js';
import { API_BASE_URL } from '../../shared/config/api.js';
import { loadUserHistory } from '../history/index.js';

// Auth mode: 'signin' or 'signup'
let authMode = 'signin';

// UI Elements
let ui = {};

// Store unsubscribe function to prevent memory leaks
let userSnapshotUnsubscribe = null;

export function initAuth() {
    // Cache UI elements
    ui = {
        // Unified auth screen elements
        authEmailInput: document.getElementById("auth-email-input"),
        authPasswordInput: document.getElementById("auth-password-input"),
        authConfirmPasswordInput: document.getElementById("auth-confirm-password-input"),
        confirmPasswordContainer: document.getElementById("confirm-password-container"),
        authErrorMessage: document.getElementById("auth-error-message"),
        authSubmitButton: document.getElementById("auth-submit-button"),
        authSubmitText: document.getElementById("auth-submit-text"),
        authScreenTitle: document.getElementById("auth-screen-title"),
        tabSignin: document.getElementById("tab-signin"),
        tabSignup: document.getElementById("tab-signup"),
        // Upload screen elements
        userGreeting: document.getElementById("user-greeting"),
        userCredits: document.getElementById("user-credits"),
    };

    setupAuthButtons();
    setupAuthStateObserver();
    setupPasswordToggles();
}

function setupAuthButtons() {
    const buttons = {
        loginEmailMain: document.getElementById("login-email-main"),
        backToMainLogin: document.getElementById("back-to-main-login"),
        authSubmit: document.getElementById("auth-submit-button"),
        logout: document.getElementById("logout-button"),
    };

    // Navigate to email auth screen
    if (buttons.loginEmailMain) {
        buttons.loginEmailMain.addEventListener("click", () => {
            setAuthMode('signin');
            showScreen("emailAuth");
        });
    }

    // Back to main login
    if (buttons.backToMainLogin) {
        buttons.backToMainLogin.addEventListener("click", () => showScreen("login"));
    }

    // Tab switching
    if (ui.tabSignin) {
        ui.tabSignin.addEventListener("click", () => setAuthMode('signin'));
    }
    if (ui.tabSignup) {
        ui.tabSignup.addEventListener("click", () => setAuthMode('signup'));
    }

    // Submit (handles both signin and signup based on authMode)
    if (buttons.authSubmit) {
        buttons.authSubmit.addEventListener("click", handleAuthSubmit);
    }

    // Logout
    if (buttons.logout) {
        buttons.logout.addEventListener("click", () => {
            cleanupAuth();
            auth.signOut();
        });
    }
}

/**
 * Set authentication mode (signin or signup)
 */
function setAuthMode(mode) {
    authMode = mode;

    // Update tab styles
    if (ui.tabSignin && ui.tabSignup) {
        if (mode === 'signin') {
            ui.tabSignin.classList.add('active');
            ui.tabSignup.classList.remove('active');
        } else {
            ui.tabSignin.classList.remove('active');
            ui.tabSignup.classList.add('active');
        }
    }

    // Update title
    if (ui.authScreenTitle) {
        ui.authScreenTitle.textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
    }

    // Update submit button text
    if (ui.authSubmitText) {
        ui.authSubmitText.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
    }

    // Show/hide confirm password field
    if (ui.confirmPasswordContainer) {
        if (mode === 'signup') {
            ui.confirmPasswordContainer.classList.remove('hidden');
        } else {
            ui.confirmPasswordContainer.classList.add('hidden');
        }
    }

    // Clear error message
    if (ui.authErrorMessage) {
        ui.authErrorMessage.textContent = '';
    }
}

/**
 * Handle auth form submission
 */
function handleAuthSubmit() {
    const email = ui.authEmailInput?.value;
    const password = ui.authPasswordInput?.value;

    if (!email || !password) {
        if (ui.authErrorMessage) {
            ui.authErrorMessage.textContent = "Please enter both email and password.";
        }
        return;
    }

    if (authMode === 'signin') {
        // Sign In
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                if (ui.authErrorMessage) {
                    ui.authErrorMessage.textContent = getErrorMessage(error.code);
                }
            });
    } else {
        // Sign Up
        const confirmPassword = ui.authConfirmPasswordInput?.value;

        if (!confirmPassword) {
            if (ui.authErrorMessage) {
                ui.authErrorMessage.textContent = "Please confirm your password.";
            }
            return;
        }

        if (password !== confirmPassword) {
            if (ui.authErrorMessage) {
                ui.authErrorMessage.textContent = "Passwords do not match.";
            }
            return;
        }

        if (password.length < 6) {
            if (ui.authErrorMessage) {
                ui.authErrorMessage.textContent = "Password must be at least 6 characters.";
            }
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .catch(error => {
                if (ui.authErrorMessage) {
                    ui.authErrorMessage.textContent = getErrorMessage(error.code);
                }
            });
    }
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/weak-password': 'Password is too weak.',
        'auth/invalid-credential': 'Invalid email or password.',
    };
    return messages[errorCode] || 'An error occurred. Please try again.';
}

/**
 * Setup password visibility toggles
 */
function setupPasswordToggles() {
    const togglePassword = document.getElementById("toggle-auth-password");
    const toggleConfirmPassword = document.getElementById("toggle-auth-confirm-password");

    if (togglePassword && ui.authPasswordInput) {
        togglePassword.addEventListener("click", () => {
            const type = ui.authPasswordInput.type === "password" ? "text" : "password";
            ui.authPasswordInput.type = type;
        });
    }

    if (toggleConfirmPassword && ui.authConfirmPasswordInput) {
        toggleConfirmPassword.addEventListener("click", () => {
            const type = ui.authConfirmPasswordInput.type === "password" ? "text" : "password";
            ui.authConfirmPasswordInput.type = type;
        });
    }
}

function setupAuthStateObserver() {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log("User is signed in:", user.email);
            if (ui.authErrorMessage) ui.authErrorMessage.textContent = "";
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
