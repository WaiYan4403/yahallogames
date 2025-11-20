// API Base URL is loaded from api-config.js

const form = document.getElementById('postForm');
const messageDiv = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const authorInput = document.getElementById('author');
const categoryInput = document.getElementById('category');
const publishedAtInput = document.getElementById('publishedAt');

const DEFAULT_AUTHOR = authorInput ? (authorInput.value || 'Tomo') : 'Tomo';
const DEFAULT_CATEGORY = categoryInput ? (categoryInput.value || "Grandma's Little Store") : "Grandma's Little Store";

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

function hideMessage() {
    messageDiv.style.display = 'none';
}

function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function setPublishedDateToToday() {
    if (!publishedAtInput) return;
    publishedAtInput.value = formatDateForInput(new Date());
}

if (publishedAtInput && !publishedAtInput.value) {
    setPublishedDateToToday();
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';

    try {
        const formData = new FormData(form);
        const data = {
            title: formData.get('title'),
            author: formData.get('author') || DEFAULT_AUTHOR,
            category: formData.get('category') || DEFAULT_CATEGORY,
            content: formData.get('content'),
            excerpt: formData.get('excerpt') || '',
            publishedAt: formData.get('publishedAt') || null
        };

        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Post published successfully!', 'success');
            form.reset();
            if (authorInput) authorInput.value = DEFAULT_AUTHOR;
            if (categoryInput) categoryInput.value = DEFAULT_CATEGORY;
            setPublishedDateToToday();
            
            setTimeout(() => {
                window.location.href = 'blog.html';
            }, 2000);
        } else {
            showMessage(result.error || 'Failed to publish post. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Make sure the server is running.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
        form.reset();
        if (authorInput) authorInput.value = DEFAULT_AUTHOR;
        if (categoryInput) categoryInput.value = DEFAULT_CATEGORY;
        setPublishedDateToToday();
        hideMessage();
    }
});

