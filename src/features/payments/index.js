/**
 * Payments Feature Module
 * Handles Stripe integration for credit purchases
 */

import { auth, db } from '../../shared/config/firebase.js';
import { STRIPE_PRICES, initStripe, getStripe } from '../../shared/config/stripe.js';
import { showScreen } from '../../shared/ui/screens.js';

export function initPayments() {
    // Initialize Stripe
    initStripe();

    setupPricingNavigation();
    setupBuyButtons();
}

function setupPricingNavigation() {
    const closePricingBtn = document.getElementById('close-pricing');
    const buyMoreCreditsBtn = document.getElementById('buy-more-credits-limit');

    // Open pricing screen from limit screen
    if (buyMoreCreditsBtn) {
        buyMoreCreditsBtn.addEventListener('click', () => {
            showScreen('pricing');
        });
    }

    // Close pricing screen
    if (closePricingBtn) {
        closePricingBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userRef = db.collection('users').doc(user.uid);
                    const doc = await userRef.get();
                    if (doc.exists) {
                        const credits = doc.data().credits || 0;
                        showScreen(credits > 0 ? 'upload' : 'limit');
                    } else {
                        showScreen('upload');
                    }
                } catch (error) {
                    console.error('Error checking credits:', error);
                    showScreen('upload');
                }
            } else {
                showScreen('login');
            }
        });
    }
}

function setupBuyButtons() {
    const buyCreditsButtons = document.querySelectorAll('.buy-credits-btn');

    if (buyCreditsButtons) {
        buyCreditsButtons.forEach(button => {
            button.addEventListener('click', async function() {
                await handlePurchase(this);
            });
        });
    }
}

async function handlePurchase(button) {
    const plan = button.getAttribute('data-plan');
    const priceId = STRIPE_PRICES[plan];
    const stripe = getStripe();

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
        console.error(`Price ID for ${plan} not configured.`);
        return;
    }

    try {
        // Disable button
        button.disabled = true;
        button.textContent = 'Processing...';

        // Create checkout session in Firestore
        const checkoutSessionRef = await db
            .collection('customers')
            .doc(user.uid)
            .collection('checkout_sessions')
            .add({
                mode: 'payment',
                price: priceId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            });

        // Wait for the Stripe extension to create the session
        // Store unsubscribe to prevent memory leak
        const unsubscribe = checkoutSessionRef.onSnapshot(async (snap) => {
            const data = snap.data();

            // Skip if data is not ready yet
            if (!data) {
                console.log('Waiting for checkout session data...');
                return;
            }

            const { error, sessionId, url } = data;

            if (error) {
                unsubscribe(); // Cleanup listener
                alert(`An error occurred: ${error.message}`);
                button.disabled = false;
                button.textContent = 'Buy Now';
                return;
            }

            // Handle redirect URL (newer extension versions)
            if (url) {
                unsubscribe(); // Cleanup listener before redirect
                window.location.assign(url);
                return;
            }

            // Handle sessionId (older extension versions)
            if (sessionId) {
                unsubscribe(); // Cleanup listener before redirect
                const { error: stripeError } = await stripe.redirectToCheckout({
                    sessionId
                });

                if (stripeError) {
                    alert(`Checkout error: ${stripeError.message}`);
                    button.disabled = false;
                    button.textContent = 'Buy Now';
                }
            }
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        alert(`An error occurred: ${error.message}`);
        button.disabled = false;
        button.textContent = 'Buy Now';
    }
}
