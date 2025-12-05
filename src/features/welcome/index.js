/**
 * Welcome/Onboarding Feature Module
 * Handles the welcome slides for new users
 */

import { showScreen } from '../../shared/ui/screens.js';

const TOTAL_SLIDES = 4;
const STORAGE_KEY = 'hasSeenWelcome';

let currentSlide = 1;

export function initWelcome() {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);

    setupWelcomeNavigation();

    // Return whether to show welcome screen
    return !hasSeenWelcome;
}

export function showWelcomeScreen() {
    showScreen("welcome");
    showWelcomeSlide(1);
}

function setupWelcomeNavigation() {
    const nextSlideBtn = document.getElementById('next-slide');
    const prevSlideBtn = document.getElementById('prev-slide');
    const skipBtn = document.getElementById('skip-welcome');

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            if (currentSlide < TOTAL_SLIDES) {
                currentSlide++;
                showWelcomeSlide(currentSlide);
            } else {
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
        skipBtn.addEventListener('click', completeWelcome);
    }
}

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

    if (prevBtn) {
        if (slideNumber === 1) {
            prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
            prevBtn.disabled = true;
        } else {
            prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            prevBtn.disabled = false;
        }
    }

    if (nextBtn) {
        nextBtn.textContent = slideNumber === TOTAL_SLIDES ? "Get Started" : "Next";
    }
}

function completeWelcome() {
    localStorage.setItem(STORAGE_KEY, 'true');
    showScreen('login');
}

export function resetWelcome() {
    localStorage.removeItem(STORAGE_KEY);
    currentSlide = 1;
}
