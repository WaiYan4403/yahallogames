// API Configuration
// Change this URL to switch between local development and production
(function() {
    if (typeof window.API_BASE_URL === 'undefined') {
        window.API_BASE_URL = 'https://yahallo-games-backend-production.up.railway.app/api';
    }
    // Also set as var for backward compatibility
    if (typeof API_BASE_URL === 'undefined') {
        var API_BASE_URL = window.API_BASE_URL;
    }
})();

// For local development, use:
// window.API_BASE_URL = 'http://localhost:3000/api';

