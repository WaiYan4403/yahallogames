const ADMIN_TOKEN_KEY = 'yahallo_admin_token';

function getAdminToken() {
    return (localStorage.getItem(ADMIN_TOKEN_KEY) || '').trim();
}

function setAdminToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
}

function clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function requestAdminToken() {
    const token = window.prompt('Enter admin access token:');
    if (!token || !token.trim()) {
        return null;
    }
    setAdminToken(token);
    return token.trim();
}

function ensureAdminAuth() {
    let token = getAdminToken();
    if (!token) {
        token = requestAdminToken();
    }

    if (!token) {
        window.location.href = 'index';
        throw new Error('Admin token is required.');
    }

    return token;
}

function getAdminHeaders(extraHeaders = {}) {
    const token = ensureAdminAuth();
    return {
        ...extraHeaders,
        'x-admin-token': token
    };
}

function handleAdminUnauthorized() {
    clearAdminToken();
    window.alert('Admin authentication failed or expired. Please enter your token again.');
    window.location.reload();
}

window.getAdminHeaders = getAdminHeaders;
window.ensureAdminAuth = ensureAdminAuth;
window.handleAdminUnauthorized = handleAdminUnauthorized;
