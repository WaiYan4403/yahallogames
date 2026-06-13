// API Base URL is loaded from api-config.js

const form = document.getElementById('emailForm');
const messageDiv = document.getElementById('messageDiv');
const resetBtn = document.getElementById('resetBtn');
const subscriberInfo = document.getElementById('subscriberInfo');

try {
    ensureAdminAuth();
} catch (error) {
    console.error(error.message);
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 8000);
    }
}

function hideMessage() {
    messageDiv.style.display = 'none';
}

async function loadSubscriberCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/mailing-list/subscribers`, {
            headers: getAdminHeaders()
        });
        const data = await response.json();

        if (response.status === 401) {
            handleAdminUnauthorized();
            return;
        }

        if (response.ok) {
            subscriberInfo.innerHTML = `
                <i class="fa-solid fa-users"></i>
                <span>${data.count} subscriber(s) will receive this email</span>
            `;
        } else {
            subscriberInfo.innerHTML = `
                <i class="fa-solid fa-exclamation-triangle"></i>
                <span>Unable to load subscriber count</span>
            `;
        }
    } catch (error) {
        console.error('Error loading subscriber count:', error);
        subscriberInfo.innerHTML = `
            <i class="fa-solid fa-exclamation-triangle"></i>
            <span>Error loading subscriber count</span>
        `;
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    try {
        const formData = new FormData(form);
        const data = {
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${API_BASE_URL}/mailing-list/send-email`, {
            method: 'POST',
            headers: getAdminHeaders({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.json();

        if (response.status === 401) {
            handleAdminUnauthorized();
            return;
        }

        if (response.ok) {
            showMessage(`Success! ${result.message}`, 'success');
            form.reset();
        } else {
            showMessage(result.error || 'Failed to send email. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'AbortError') {
            showMessage('Request timed out. Email sending may still be in progress. Please check your SMTP configuration.', 'error');
        } else {
            showMessage('Network error. Make sure the server is running and email is configured.', 'error');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the form? All unsaved changes will be lost.')) {
        form.reset();
        hideMessage();
    }
});

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', loadSubscriberCount); } else { loadSubscriberCount(); }

