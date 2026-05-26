const inquiriesList = document.getElementById('inquiriesList');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const messageDiv = document.getElementById('message');

try {
    ensureAdminAuth();
} catch (error) {
    console.error(error.message);
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderInquiry(inquiry) {
    return `
        <div class="post-item">
            <div class="post-header">
                <h3 class="post-title">${escapeHtml(inquiry.name)} (${escapeHtml(inquiry.type)})</h3>
            </div>
            <div class="post-meta">
                <span>
                    <i class="fa-solid fa-envelope"></i>
                    ${escapeHtml(inquiry.email)}
                </span>
                <span>
                    <i class="fa-solid fa-calendar"></i>
                    Submitted: ${formatDate(inquiry.submittedAt)}
                </span>
                <span>
                    <i class="fa-solid fa-paper-plane"></i>
                    Status: ${escapeHtml(inquiry.status)}
                </span>
                <span>
                    <i class="fa-solid fa-clock"></i>
                    Sent: ${inquiry.emailSentAt ? formatDate(inquiry.emailSentAt) : 'N/A'}
                </span>
            </div>
            <div class="post-excerpt">
                ${escapeHtml(inquiry.message)}
            </div>
        </div>
    `;
}

async function loadInquiries() {
    try {
        loading.style.display = 'flex';
        inquiriesList.innerHTML = '';
        emptyState.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/contact/inquiries?limit=100`, {
            headers: getAdminHeaders()
        });
        const data = await response.json();

        if (response.status === 401) {
            handleAdminUnauthorized();
            return;
        }

        if (response.ok && data.inquiries && data.inquiries.length > 0) {
            inquiriesList.innerHTML = data.inquiries.map(renderInquiry).join('');
            loading.style.display = 'none';
        } else {
            loading.style.display = 'none';
            emptyState.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading inquiries:', error);
        loading.style.display = 'none';
        showMessage('Error loading inquiries. Make sure the server is running.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadInquiries);
