const contactForm = document.getElementById('contactInquiryForm');
const contactMessage = document.getElementById('contactFormMessage');
const formStartedAtInput = document.getElementById('formStartedAt');
const contactSubmitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

if (formStartedAtInput) {
    formStartedAtInput.value = Date.now().toString();
}

function trackContactEvent(eventName, payload) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
    }
}

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const type = (formData.get('type') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();
        const company = (formData.get('company') || '').toString().trim();
        const formStartedAt = (formData.get('formStartedAt') || '').toString().trim();

        if (!name || !email || !type || !message) {
            contactMessage.textContent = 'Please complete all required fields.';
            return;
        }

        if (typeof API_BASE_URL === 'undefined') {
            contactMessage.textContent = 'Contact service is temporarily unavailable. Please try again later.';
            return;
        }

        const originalBtnText = contactSubmitBtn ? contactSubmitBtn.innerHTML : '';
        if (contactSubmitBtn) {
            contactSubmitBtn.disabled = true;
            contactSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        }

        try {
            const response = await fetch(`${API_BASE_URL}/contact/inquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    type,
                    message,
                    company,
                    formStartedAt
                })
            });

            const result = await response.json();

            if (!response.ok) {
                trackContactEvent('contact_inquiry_error', {
                    inquiry_type: type,
                    status: response.status
                });
                contactMessage.textContent = result.error || 'Failed to send inquiry. Please try again later.';
                return;
            }

            trackContactEvent('contact_inquiry_submitted', {
                inquiry_type: type
            });

            contactMessage.textContent = result.message || 'Inquiry sent successfully. We will get back to you soon.';
            contactForm.reset();
            if (formStartedAtInput) {
                formStartedAtInput.value = Date.now().toString();
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            trackContactEvent('contact_inquiry_error', {
                inquiry_type: type,
                status: 'network_error'
            });
            contactMessage.textContent = 'Network error. Please check your connection and try again.';
        } finally {
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.innerHTML = originalBtnText;
            }
        }
    });
}
