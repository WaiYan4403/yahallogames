// API Configuration
// Change this URL to switch between local development and production
(function() {
    if (typeof window.API_BASE_URL === 'undefined') {
        window.API_BASE_URL = 'https://yahallo-games-backend-production.up.railway.app/api';
    }
    if (typeof window.GA_MEASUREMENT_ID === 'undefined') {
        window.GA_MEASUREMENT_ID = '';
    }
    // Also set as var for backward compatibility
    if (typeof API_BASE_URL === 'undefined') {
        var API_BASE_URL = window.API_BASE_URL;
    }
})();

// For local development, use:
// window.API_BASE_URL = 'http://localhost:3000/api';
window.GA_MEASUREMENT_ID = 'G-L9Q1SKLFL2';

