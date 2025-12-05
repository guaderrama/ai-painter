/**
 * Stripe Configuration
 * Centralizes Stripe initialization and price IDs
 */

// Price IDs from Stripe Dashboard
export const STRIPE_PRICES = {
    starter: 'price_1SJ0UWGdnHfsTKebUDHcFzL3',
    popular: 'price_1SJ0eSGdnHfsTKeb3RErkfWa',
    pro: 'price_REPLACE_WITH_YOUR_PRO_PRICE_ID',
    artist: 'price_REPLACE_WITH_YOUR_ARTIST_PRICE_ID',
};

// Stripe Publishable Key
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51N4Hx4GdnHfsTKebYwuwrVG9P5Eu6b2G7tnoECAFcomtCNyFCF0IfnuUeWsMPwbBkZbDrvgpuEw8JePcVuHait5W00022FKcge';

// Initialize Stripe
let stripe = null;

export function initStripe() {
    try {
        if (STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.includes('REPLACE')) {
            stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        } else {
            console.warn('Stripe not initialized: Please add your Publishable Key');
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
    return stripe;
}

export function getStripe() {
    return stripe;
}
