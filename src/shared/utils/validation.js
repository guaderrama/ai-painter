/**
 * Validation Utilities
 * Email, password strength, and form validation helpers
 */

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function checkPasswordStrength(password) {
    const strengthBars = [
        document.getElementById('strength-bar-1'),
        document.getElementById('strength-bar-2'),
        document.getElementById('strength-bar-3'),
        document.getElementById('strength-bar-4')
    ];
    const strengthText = document.getElementById('password-strength-text');

    if (!password) {
        strengthBars.forEach(bar => {
            if (bar) bar.style.backgroundColor = '#293038';
        });
        if (strengthText) strengthText.textContent = '';
        return 0;
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
        if (bar) {
            bar.style.backgroundColor = index < strength ? colors[strength - 1] : '#293038';
        }
    });

    if (strengthText && strength > 0) {
        strengthText.textContent = labels[strength - 1];
        strengthText.style.color = colors[strength - 1];
    }

    return strength;
}

export function setupInlineValidation() {
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
