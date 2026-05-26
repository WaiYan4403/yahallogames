const contactForm = document.getElementById('contactInquiryForm');
const contactMessage = document.getElementById('contactFormMessage');

function trackContactEvent(eventName, payload) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
    }
}

if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const type = (formData.get('type') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        if (!name || !email || !type || !message) {
            contactMessage.textContent = 'Please complete all required fields.';
            return;
        }

        const subject = encodeURIComponent(`[${type}] Inquiry from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nInquiry Type: ${type}\n\nMessage:\n${message}`
        );

        trackContactEvent('contact_inquiry_submitted', {
            inquiry_type: type
        });

        window.location.href = `mailto:yahallogames@gmail.com?subject=${subject}&body=${body}`;
        contactMessage.textContent = 'Opening your email app to send this inquiry.';
    });
}
