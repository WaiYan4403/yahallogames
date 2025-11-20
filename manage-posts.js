// API Base URL is loaded from api-config.js

const postsList = document.getElementById('postsList');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const messageDiv = document.getElementById('message');

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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function truncateText(text, maxLength = 150) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function renderPost(post) {
    const excerpt = post.excerpt || truncateText(post.content);
    const publishedDate = formatDate(post.publishedAt);
    const createdDate = formatDate(post.createdAt);

    return `
        <div class="post-item" data-id="${post._id}">
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
            </div>
            <div class="post-meta">
                <span>
                    <i class="fa-solid fa-user"></i>
                    ${post.author}
                </span>
                <span>
                    <i class="fa-solid fa-folder"></i>
                    ${post.category}
                </span>
                <span>
                    <i class="fa-solid fa-calendar"></i>
                    Published: ${publishedDate}
                </span>
                <span>
                    <i class="fa-solid fa-clock"></i>
                    Created: ${createdDate}
                </span>
            </div>
            <div class="post-excerpt">
                ${excerpt}
            </div>
            <div class="post-actions">
                <a href="blog-post.html?id=${post._id}" class="action-btn view-btn" target="_blank">
                    <i class="fa-solid fa-eye"></i>
                    View
                </a>
                <a href="edit-post.html?id=${post._id}" class="action-btn edit-btn">
                    <i class="fa-solid fa-edit"></i>
                    Edit
                </a>
                <button class="action-btn delete-btn" onclick="deletePost('${post._id}', '${post.title.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
}

async function loadPosts() {
    try {
        loading.style.display = 'flex';
        postsList.innerHTML = '';
        emptyState.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/posts/manage/all`);
        const data = await response.json();

        if (response.ok && data.posts && data.posts.length > 0) {
            postsList.innerHTML = data.posts.map(post => renderPost(post)).join('');
            loading.style.display = 'none';
        } else {
            loading.style.display = 'none';
            emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.style.display = 'none';
        showMessage('Error loading posts. Make sure the server is running.', 'error');
    }
}

async function deletePost(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Post deleted successfully!', 'success');
            loadPosts();
        } else {
            showMessage(data.error || 'Failed to delete post.', 'error');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showMessage('Network error. Make sure the server is running.', 'error');
    }
}

window.deletePost = deletePost;

document.addEventListener('DOMContentLoaded', loadPosts);

