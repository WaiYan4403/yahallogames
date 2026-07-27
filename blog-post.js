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

function stripHtml(input) {
    return (input || '').replace(/<[^>]*>/g, '').trim();
}

function updateBlogPostStructuredData(post) {
    if (!post) return;

    const scriptId = 'blogposting-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const postId = post._id || '';
    const postUrl = postId
        ? `https://yahallogames.com/blog-post?id=${encodeURIComponent(postId)}`
        : 'https://yahallogames.com/blog-post';

    const plainTextContent = stripHtml(post.content || '');
    const description = (post.excerpt || plainTextContent).slice(0, 280);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title || 'Yahallo Games Blog Post',
        description,
        image: 'https://yahallogames.com/Images/YahalloGamesLogo.png',
        author: {
            '@type': 'Person',
            name: post.author || 'Yahallo Games'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Yahallo Games',
            logo: {
                '@type': 'ImageObject',
                url: 'https://yahallogames.com/Images/YahalloGamesLogo.png'
            }
        },
        datePublished: post.publishedAt || new Date().toISOString(),
        dateModified: post.updatedAt || post.publishedAt || new Date().toISOString(),
        mainEntityOfPage: postUrl,
        articleSection: post.category || 'Updates'
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
}

function setMetaAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element && value) {
        element.setAttribute(attribute, value);
    }
}

function updateBlogPostMeta(post) {
    if (!post) return;

    const postId = post._id || '';
    const postUrl = postId
        ? `https://yahallogames.com/blog-post?id=${encodeURIComponent(postId)}`
        : 'https://yahallogames.com/blog-post';
    const plainTextContent = stripHtml(post.content || '');
    const description = (post.excerpt || plainTextContent || 'Read the latest post from Yahallo Games.').slice(0, 160);
    const title = `${post.title || 'Blog Post'} - Yahallo Games Blog`;

    document.title = title;

    setMetaAttribute('meta[name="description"]', 'content', description);
    setMetaAttribute('meta[property="og:title"]', 'content', title);
    setMetaAttribute('meta[property="og:description"]', 'content', description);
    setMetaAttribute('meta[property="og:url"]', 'content', postUrl);
    setMetaAttribute('meta[name="twitter:title"]', 'content', title);
    setMetaAttribute('meta[name="twitter:description"]', 'content', description);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', postUrl);

    const publishedIso = post.publishedAt ? new Date(post.publishedAt).toISOString() : '';
    const modifiedIso = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedIso;
    setMetaAttribute('meta[property="article:published_time"]', 'content', publishedIso);
    setMetaAttribute('meta[property="article:modified_time"]', 'content', modifiedIso);
}

// Render single blog post
function renderBlogPost(post) {
    const formattedDate = formatDate(post.publishedAt);
    const formattedContent = formatContent(post.content);
    const postId = post._id || '';
    const postUrl = postId
        ? `https://yahallogames.com/blog-post?id=${encodeURIComponent(postId)}`
        : 'https://yahallogames.com/blog-post';
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(`${post.title} - Yahallo Games Blog`);
    
    return `
        <div class="blog-post-container">
            <div class="blog-post-header">
                <img src="Images/DeveloperProfile.jpg" alt="${post.title}" class="blog-post-image" loading="eager" decoding="async">
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
            <div class="share-section">
                <span class="share-label">Share this post:</span>
                <a class="share-btn" href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer" aria-label="Share on X">
                    <i class="fa-brands fa-x-twitter"></i>
                    X
                </a>
                <a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <i class="fa-brands fa-facebook-f"></i>
                    Facebook
                </a>
                <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                    <i class="fa-brands fa-linkedin-in"></i>
                    LinkedIn
                </a>
                <button class="share-btn" type="button" data-copy-url="${postUrl}" aria-label="Copy post link">
                    <i class="fa-solid fa-link"></i>
                    Copy Link
                </button>
            </div>
        </div>
    `;
}

function setupShareActions() {
    const copyBtn = document.querySelector('[data-copy-url]');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        const url = copyBtn.getAttribute('data-copy-url');
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link';
            }, 1500);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });
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
        setupShareActions();

        updateBlogPostMeta(post);
        updateBlogPostStructuredData(post);
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
        backButton.href = `blog?page=${page}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBackButton();
    loadBlogPost();
});

