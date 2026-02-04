/**
 * BacklinkSpy - Competitor Backlink Analysis Tool
 * Simulates backlink analysis for demonstration purposes
 */

// Sample data generator for demonstration
const sampleDomains = [
    'techcrunch.com', 'forbes.com', 'entrepreneur.com', 'medium.com',
    'hubspot.com', 'neilpatel.com', 'moz.com', 'ahrefs.com', 'semrush.com',
    'searchenginejournal.com', 'backlinko.com', 'wordstream.com',
    'contentmarketinginstitute.com', 'copyblogger.com', 'socialmediaexaminer.com'
];

const anchorTexts = [
    'click here', 'read more', 'learn more', 'visit website', 'official site',
    'SEO guide', 'marketing tips', 'best practices', 'case study', 'resource',
    'check this out', 'recommended', 'top rated', 'expert advice', 'tutorial'
];

// DOM Elements
const domainInput = document.getElementById('domainInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const exportBtn = document.getElementById('exportBtn');
const resultsPanel = document.getElementById('resultsPanel');
const statsGrid = document.getElementById('statsGrid');
const backlinksBody = document.getElementById('backlinksBody');
const placeholder = document.getElementById('placeholder');
const includeSubdomains = document.getElementById('includeSubdomains');
const onlyDofollow = document.getElementById('onlyDofollow');

// Stats elements
const totalBacklinksEl = document.getElementById('totalBacklinks');
const referringDomainsEl = document.getElementById('referringDomains');
const domainAuthorityEl = document.getElementById('domainAuthority');
const dofollowRatioEl = document.getElementById('dofollowRatio');

let currentResults = [];

/**
 * Validates if the input is a proper domain format
 */
function isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain.trim());
}

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date within the past year
 */
function randomDate() {
    const now = new Date();
    const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const randomTime = pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
    return new Date(randomTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Generates simulated backlink data for demonstration
 */
function generateBacklinkData(domain) {
    const numberOfBacklinks = randomInt(15, 40);
    const results = [];
    const usedDomains = new Set();

    for (let i = 0; i < numberOfBacklinks; i++) {
        let sourceDomain;
        do {
            sourceDomain = sampleDomains[randomInt(0, sampleDomains.length - 1)];
        } while (usedDomains.has(sourceDomain) && usedDomains.size < sampleDomains.length);
        
        usedDomains.add(sourceDomain);
        
        const isDofollow = Math.random() > 0.35;
        
        results.push({
            sourceDomain,
            anchorText: anchorTexts[randomInt(0, anchorTexts.length - 1)],
            domainAuthority: randomInt(20, 95),
            type: isDofollow ? 'dofollow' : 'nofollow',
            firstSeen: randomDate()
        });
    }

    // Sort by domain authority descending
    return results.sort((a, b) => b.domainAuthority - a.domainAuthority);
}

/**
 * Calculates and displays statistics from backlink data
 */
function displayStats(data) {
    const totalBacklinks = data.length;
    const uniqueDomains = new Set(data.map(item => item.sourceDomain)).size;
    const avgDA = Math.round(data.reduce((sum, item) => sum + item.domainAuthority, 0) / totalBacklinks);
    const dofollowCount = data.filter(item => item.type === 'dofollow').length;
    const dofollowPercent = Math.round((dofollowCount / totalBacklinks) * 100);

    // Animate stats
    animateValue(totalBacklinksEl, 0, totalBacklinks, 800);
    animateValue(referringDomainsEl, 0, uniqueDomains, 800);
    animateValue(domainAuthorityEl, 0, avgDA, 800);
    animateValue(dofollowRatioEl, 0, dofollowPercent, 800, '%');
}

/**
 * Animates a numeric value from start to end
 */
function animateValue(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const currentValue = Math.round(start + (end - start) * easeProgress);
        
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Renders the backlinks table with the provided data
 */
function renderBacklinksTable(data) {
    backlinksBody.innerHTML = '';
    
    const filteredData = onlyDofollow.checked 
        ? data.filter(item => item.type === 'dofollow')
        : data;

    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('fade-in-row');
        
        row.innerHTML = `
            <td>
                <span class="domain-link">
                    <i class="fas fa-external-link-alt"></i>
                    ${item.sourceDomain}
                </span>
            </td>
            <td><span class="anchor-text">${item.anchorText}</span></td>
            <td>
                <span class="da-badge ${getDaBadgeClass(item.domainAuthority)}">
                    ${item.domainAuthority}
                </span>
            </td>
            <td>
                <span class="link-type ${item.type}">
                    ${item.type}
                </span>
            </td>
            <td>${item.firstSeen}</td>
        `;
        
        backlinksBody.appendChild(row);
    });
}

/**
 * Returns the appropriate CSS class based on domain authority score
 */
function getDaBadgeClass(da) {
    if (da >= 70) return 'da-high';
    if (da >= 40) return 'da-medium';
    return 'da-low';
}

/**
 * Main analysis function triggered by the Analyze button
 */
function analyzeBacklinks() {
    const domain = domainInput.value.trim();
    
    if (!domain) {
        showNotification('Please enter a domain to analyze', 'warning');
        domainInput.focus();
        return;
    }
    
    if (!isValidDomain(domain)) {
        showNotification('Please enter a valid domain format (e.g., example.com)', 'error');
        domainInput.focus();
        return;
    }
    
    // Show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    // Simulate API delay
    setTimeout(() => {
        currentResults = generateBacklinkData(domain);
        
        placeholder.style.display = 'none';
        statsGrid.style.display = 'grid';
        document.querySelector('.backlinks-table-container').style.display = 'block';
        
        displayStats(currentResults);
        renderBacklinksTable(currentResults);
        
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Backlinks';
        
        showNotification(`Found ${currentResults.length} backlinks for ${domain}`, 'success');
    }, 1500);
}

/**
 * Exports the current results to CSV format
 */
function exportToCSV() {
    if (currentResults.length === 0) {
        showNotification('No data to export. Run an analysis first.', 'warning');
        return;
    }
    
    const headers = ['Source Domain', 'Anchor Text', 'Domain Authority', 'Link Type', 'First Seen'];
    const csvContent = [
        headers.join(','),
        ...currentResults.map(item => 
            `"${item.sourceDomain}","${item.anchorText}",${item.domainAuthority},"${item.type}","${item.firstSeen}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `backlink-analysis-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('CSV exported successfully!', 'success');
}

/**
 * Displays a notification toast message
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Event Listeners
analyzeBtn.addEventListener('click', analyzeBacklinks);
exportBtn.addEventListener('click', exportToCSV);

// Allow Enter key to trigger analysis
domainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeBacklinks();
    }
});

// Update table when filter changes
onlyDofollow.addEventListener('change', () => {
    if (currentResults.length > 0) {
        renderBacklinksTable(currentResults);
    }
});

// Initial state
statsGrid.style.display = 'none';
document.querySelector('.backlinks-table-container').style.display = 'none';
