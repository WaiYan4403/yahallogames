// API Base URL is loaded from api-config.js

// Get post ID from URL
function getPostId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Get page number from URL (for back button)
function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || '1';
}

// Format date to "12th Feb, 2025" format
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    // Add ordinal suffix
    const ordinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    
    return `${ordinal(day)} ${month}, ${year}`;
}

// Convert plain text to paragraphs (basic formatting)
function formatContent(content) {
    if (!content) return '';
    // Split by double newlines to create paragraphs
    const paragraphs = content.split(/\n\n+/);
    return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
}

// Render single blog post
function renderBlogPost(post) {
    const formattedDate = formatDate(post.publishedAt);
    const formattedContent = formatContent(post.content);
    
    return `
        <div class="blog-post-container">
            <div class="blog-post-header">
                <img src="Images/DeveloperProfile.jpg" alt="${post.title}" class="blog-post-image">
                <div style="flex: 1;">
                    <h2 class="blog-post-title">${post.title}</h2>
                    <div class="blog-post-meta">
                        <span class="author">${post.author}</span> posted on 
                        <span class="date">${formattedDate}</span> in 
                        <span class="category">${post.category}</span>
                    </div>
                </div>
            </div>
            <div class="blog-post-content">
                ${formattedContent}
            </div>
        </div>
    `;
}

// Load single blog post
async function loadBlogPost() {
    const postId = getPostId();
    const container = document.getElementById('blogPostContainer');
    
    if (!postId) {
        container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">No post ID provided.</p>';
        return;
    }
    
    try {
        container.innerHTML = '<p style="color: #fff; text-align: center;">Loading...</p>';
        
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        
        if (!response.ok) {
            throw new Error('Post not found');
        }
        
        const post = await response.json();
        container.innerHTML = renderBlogPost(post);
        
        // Update page title
        document.title = `${post.title} - Yahallo Games Blog`;
    } catch (error) {
        console.error('Error loading blog post:', error);
        container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Error loading blog post. Make sure the server is running and the post exists.</p>';
    }
}

// Update back button with pagination
function updateBackButton() {
    const page = getPageFromUrl();
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.href = `blog.html?page=${page}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBackButton();
    loadBlogPost();
});

