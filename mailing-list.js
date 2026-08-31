// API Base URL is loaded from api-config.js

const form = document.getElementById('mailingListForm');
const emailInput = document.getElementById('emailInput');
const messageDiv = document.getElementById('mailingListMessage');
const websiteInput = document.getElementById('mailingListWebsite');
const formStartedAtInput = document.getElementById('mailingListFormStartedAt');

if (formStartedAtInput) {
    formStartedAtInput.value = Date.now().toString();
}

function trackEvent(eventName, payload) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
    }
}

function setupOutboundTracking() {
    const links = document.querySelectorAll('[data-track]');

    links.forEach((link) => {
        link.addEventListener('click', () => {
            const eventName = link.dataset.track;
            if (!eventName) return;

            trackEvent(eventName, {
                game: link.dataset.game || undefined,
                platform: link.dataset.platform || undefined,
                href: link.href
            });
        });
    });
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `mailing-list-message ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
            emailInput.value = '';
        }, 5000);
    }
}

function hideMessage() {
    messageDiv.style.display = 'none';
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();

        const email = emailInput.value.trim();
        const website = websiteInput ? websiteInput.value.trim() : '';
        const formStartedAt = formStartedAtInput ? formStartedAtInput.value : '';
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        if (!email) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...';

        try {
            if (typeof API_BASE_URL === 'undefined') {
                throw new Error('API configuration not loaded');
            }

            const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, website, formStartedAt })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                trackEvent('newsletter_subscribe_success', {
                    source: 'homepage'
                });
                showMessage(result.message || 'Thanks! Please check your email to confirm your subscription.', 'success');
                if (formStartedAtInput) {
                    formStartedAtInput.value = Date.now().toString();
                }
            } else {
                trackEvent('newsletter_subscribe_error', {
                    source: 'homepage'
                });
                showMessage(result.message || 'Failed to subscribe. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            trackEvent('newsletter_subscribe_error', {
                source: 'homepage'
            });
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

setupOutboundTracking();

