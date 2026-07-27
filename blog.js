// API Base URL is loaded from api-config.js
// API_BASE_URL is defined in api-config.js as a global variable

const BLOG_CACHE_KEY = 'yahallo_blog_cache_v1';

function saveBlogCache(data) {
    try {
        localStorage.setItem(BLOG_CACHE_KEY, JSON.stringify({
            timestamp: new Date().toISOString(),
            data
        }));
    } catch (error) {
        console.warn('Failed to save blog cache:', error);
    }
}

function loadBlogCache() {
    try {
        const raw = localStorage.getItem(BLOG_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data || !Array.isArray(parsed.data.posts)) return null;
        return parsed;
    } catch (error) {
        console.warn('Failed to load blog cache:', error);
        return null;
    }
}

// Get current page from URL or default to 1
function getCurrentPage() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page')) || 1;
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

// Create excerpt from content
function createExcerpt(content, maxLength = 200) {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Render blog post card
function renderBlogPost(post, currentPage) {
    const excerpt = post.excerpt || createExcerpt(post.content);
    const formattedDate = formatDate(post.publishedAt);
    
    return `
        <div class="blog-post-card">
            <div class="blog-post-header">
                <img src="Images/DeveloperProfile.jpg" alt="${post.title}" class="blog-post-image" loading="lazy" decoding="async">
                <div style="flex: 1;">
                    <h2 class="blog-post-title">${post.title}</h2>
                    <div class="blog-post-meta">
                        <span class="author">${post.author}</span> posted on 
                        <span class="date">${formattedDate}</span> in 
                        <span class="category">${post.category}</span>
                    </div>
                </div>
            </div>
            <div class="blog-post-excerpt">
                <p>${excerpt}</p>
            </div>
            <a href="blog-post?id=${post._id}&page=${currentPage}" class="continue-reading">Continue Reading >></a>
        </div>
    `;
}

// Render pagination
function renderPagination(pagination) {
    const prevLink = pagination.hasPrev 
        ? `<a href="blog?page=${pagination.currentPage - 1}">Previous</a>`
        : '<span style="color: #666;">Previous</span>';
    
    const nextLink = pagination.hasNext 
        ? `<a href="blog?page=${pagination.currentPage + 1}">Next</a>`
        : '<span style="color: #666;">Next</span>';
    
    return `
        <div class="pagination">
            <div class="pagination-links">
                ${prevLink} | ${nextLink}
            </div>
            <div class="pagination-info">
                Page ${pagination.currentPage} of ${pagination.totalPages}
            </div>
        </div>
    `;
}

// Load blog posts
async function loadBlogPosts() {
    const currentPage = getCurrentPage();
    const container = document.getElementById('blogPostsContainer');
    const paginationContainer = document.getElementById('pagination');
    
    if (typeof API_BASE_URL === 'undefined') {
        container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Configuration error: API URL not defined.</p>';
        console.error('API_BASE_URL is undefined');
        return;
    }
    
    try {
        container.innerHTML = '<p style="color: #fff; text-align: center;">Loading...</p>';
        
        const url = `${API_BASE_URL}/posts?page=${currentPage}&limit=10`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        saveBlogCache(data);
        
        if (data.posts && data.posts.length > 0) {
            container.innerHTML = data.posts.map(post => renderBlogPost(post, currentPage)).join('');
            if (data.pagination) {
                paginationContainer.innerHTML = renderPagination(data.pagination);
            }
        } else {
            container.innerHTML = '<p style="color: #fff; text-align: center;">No blog posts found.</p>';
            paginationContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        const cached = loadBlogCache();

        if (cached && cached.data.posts.length > 0) {
            container.innerHTML = `
                <p style="color: #ffd36e; text-align: center; margin-bottom: 16px;">
                    Showing cached posts because the latest content is temporarily unavailable.
                </p>
                ${cached.data.posts.map(post => renderBlogPost(post, currentPage)).join('')}
            `;

            if (cached.data.pagination) {
                paginationContainer.innerHTML = renderPagination(cached.data.pagination);
            } else {
                paginationContainer.innerHTML = '';
            }
            return;
        }

        container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Blog posts are temporarily unavailable. Please try again later.</p>';
        paginationContainer.innerHTML = '';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadBlogPosts);

