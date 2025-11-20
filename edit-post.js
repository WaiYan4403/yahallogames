// API Base URL is loaded from api-config.js

const form = document.getElementById('postForm');
const loading = document.getElementById('loading');
const messageDiv = document.getElementById('message');
const cancelBtn = document.getElementById('cancelBtn');

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

if (!postId) {
    showMessage('No post ID provided. Redirecting...', 'error');
    setTimeout(() => {
        window.location.href = 'manage-posts.html';
    }, 2000);
}

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

async function loadPost() {
    if (!postId) return;

    try {
        loading.style.display = 'flex';
        form.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        const post = await response.json();

        if (response.ok) {
            document.getElementById('title').value = post.title || '';
            document.getElementById('author').value = post.author || 'Tomo';
            document.getElementById('category').value = post.category || "Grandma's Little Store";
            document.getElementById('excerpt').value = post.excerpt || '';
            document.getElementById('content').value = post.content || '';
            
            if (post.publishedAt) {
                document.getElementById('publishedAt').value = formatDateForInput(post.publishedAt);
            }

            loading.style.display = 'none';
            form.style.display = 'flex';
        } else {
            showMessage(post.error || 'Failed to load post.', 'error');
            loading.style.display = 'none';
            setTimeout(() => {
                window.location.href = 'manage-posts.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showMessage('Network error. Make sure the server is running.', 'error');
        loading.style.display = 'none';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();

    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    try {
        const formData = new FormData(form);
        const data = {
            title: formData.get('title'),
            author: formData.get('author') || 'Tomo',
            category: formData.get('category') || "Grandma's Little Store",
            content: formData.get('content'),
            excerpt: formData.get('excerpt') || '',
            publishedAt: formData.get('publishedAt') || null
        };

        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Post updated successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'manage-posts.html';
            }, 2000);
        } else {
            showMessage(result.error || 'Failed to update post. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Make sure the server is running.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

cancelBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
        window.location.href = 'manage-posts.html';
    }
});

document.addEventListener('DOMContentLoaded', loadPost);

