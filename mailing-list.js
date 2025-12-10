// API Base URL is loaded from api-config.js

const form = document.getElementById('mailingListForm');
const emailInput = document.getElementById('emailInput');
const messageDiv = document.getElementById('mailingListMessage');

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
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...';

        try {
            if (typeof API_BASE_URL === 'undefined') {
                throw new Error('API configuration not loaded');
            }

            const response = await fetch(`${API_BASE_URL}/mailing-list/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message || 'Successfully subscribed!', 'success');
            } else {
                showMessage(result.error || 'Failed to subscribe. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

