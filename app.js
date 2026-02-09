/**
 * BacklinkSpy - Competitor Backlink Analysis Tool
 * @fileoverview Main application logic for analyzing competitor backlink profiles.
 * Simulates backlink analysis for demonstration purposes.
 * @version 2.0.0
 * @license MIT
 */

'use strict';

/* ============================================================================
   CONFIGURATION CONSTANTS
   Centralized configuration for easy maintenance and tweaking
   ============================================================================ */

/**
 * Application configuration object
 * @constant {Object}
 */
const CONFIG = {
    /** Minimum number of backlinks to generate */
    MIN_BACKLINKS: 15,
    /** Maximum number of backlinks to generate */
    MAX_BACKLINKS: 40,
    /** Minimum domain authority score */
    MIN_DA: 20,
    /** Maximum domain authority score */
    MAX_DA: 95,
    /** Probability of a link being dofollow (0.65 = 65%) */
    DOFOLLOW_PROBABILITY: 0.65,
    /** Animation duration for stat counters in ms */
    ANIMATION_DURATION: 800,
    /** Simulated API delay in ms */
    API_DELAY: 1500,
    /** Toast notification display duration in ms */
    NOTIFICATION_DURATION: 4000,
    /** Row animation delay multiplier in seconds */
    ROW_ANIMATION_DELAY: 0.05,
    /** DA thresholds for badge colors */
    DA_THRESHOLDS: {
        HIGH: 70,
        MEDIUM: 40
    }
};

/* ============================================================================
   LOGGING SYSTEM
   Structured logging with levels for debugging and monitoring
   ============================================================================ */

/**
 * Logger utility for structured console output
 * @namespace Logger
 */
const Logger = {
    /** Log level constants */
    LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },

    /** Current log level (set to INFO for production) */
    currentLevel: 1,

    /**
     * Formats the current timestamp for log messages
     * @private
     * @returns {string} Formatted timestamp [HH:MM:SS.mmm]
     */
    _getTimestamp() {
        const now = new Date();
        return `[${now.toLocaleTimeString('en-US', { hour12: false })}.${String(now.getMilliseconds()).padStart(3, '0')}]`;
    },

    /**
     * Logs a debug message (development only)
     * @param {string} message - Log message
     * @param {Object} [data] - Optional data to log
     */
    debug(message, data = null) {
        if (this.currentLevel <= this.LEVELS.DEBUG) {
            console.log(`${this._getTimestamp()} [DEBUG] ${message}`, data || '');
        }
    },

    /**
     * Logs an info message
     * @param {string} message - Log message
     * @param {Object} [data] - Optional data to log
     */
    info(message, data = null) {
        if (this.currentLevel <= this.LEVELS.INFO) {
            console.info(`${this._getTimestamp()} [INFO] ${message}`, data || '');
        }
    },

    /**
     * Logs a warning message
     * @param {string} message - Log message
     * @param {Object} [data] - Optional data to log
     */
    warn(message, data = null) {
        if (this.currentLevel <= this.LEVELS.WARN) {
            console.warn(`${this._getTimestamp()} [WARN] ${message}`, data || '');
        }
    },

    /**
     * Logs an error message
     * @param {string} message - Log message
     * @param {Error|Object} [error] - Optional error object
     */
    error(message, error = null) {
        if (this.currentLevel <= this.LEVELS.ERROR) {
            console.error(`${this._getTimestamp()} [ERROR] ${message}`, error || '');
        }
    }
};

/* ============================================================================
   SAMPLE DATA
   Mock data for demonstration purposes
   ============================================================================ */

/**
 * Sample referring domains for backlink generation
 * @constant {string[]}
 */
const SAMPLE_DOMAINS = [
    'techcrunch.com', 'forbes.com', 'entrepreneur.com', 'medium.com',
    'hubspot.com', 'neilpatel.com', 'moz.com', 'ahrefs.com', 'semrush.com',
    'searchenginejournal.com', 'backlinko.com', 'wordstream.com',
    'contentmarketinginstitute.com', 'copyblogger.com', 'socialmediaexaminer.com'
];

/**
 * Sample anchor texts for backlink generation
 * @constant {string[]}
 */
const ANCHOR_TEXTS = [
    'click here', 'read more', 'learn more', 'visit website', 'official site',
    'SEO guide', 'marketing tips', 'best practices', 'case study', 'resource',
    'check this out', 'recommended', 'top rated', 'expert advice', 'tutorial'
];

/* ============================================================================
   DOM ELEMENTS
   Cached DOM references for performance
   ============================================================================ */

/**
 * DOM element cache object
 * @type {Object.<string, HTMLElement>}
 */
const DOM = {
    domainInput: document.getElementById('domainInput'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    exportBtn: document.getElementById('exportBtn'),
    resultsPanel: document.getElementById('resultsPanel'),
    statsGrid: document.getElementById('statsGrid'),
    backlinksBody: document.getElementById('backlinksBody'),
    placeholder: document.getElementById('placeholder'),
    includeSubdomains: document.getElementById('includeSubdomains'),
    onlyDofollow: document.getElementById('onlyDofollow'),
    totalBacklinks: document.getElementById('totalBacklinks'),
    referringDomains: document.getElementById('referringDomains'),
    domainAuthority: document.getElementById('domainAuthority'),
    dofollowRatio: document.getElementById('dofollowRatio')
};

/** Current analysis results storage */
let currentResults = [];

/* ============================================================================
   UTILITY FUNCTIONS
   Helper functions for common operations
   ============================================================================ */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML-safe string
 * @example
 * escapeHtml('<script>alert("xss")</script>') // Returns escaped safe string
 */
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return String(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Validates if the input is a proper domain format
 * @param {string} domain - Domain string to validate
 * @returns {boolean} True if valid domain format
 * @example
 * isValidDomain('example.com') // Returns true
 * isValidDomain('not-a-domain') // Returns false
 */
function isValidDomain(domain) {
    if (!domain || typeof domain !== 'string') {
        return false;
    }
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain.trim());
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer in range [min, max]
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date within the past year
 * @returns {string} Formatted date string (e.g., "Jan 15, 2025")
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

/* ============================================================================
   DATA GENERATION
   Functions for generating simulated backlink data
   ============================================================================ */

/**
 * Generates simulated backlink data for demonstration
 * @param {string} domain - Target domain being analyzed
 * @returns {Array<Object>} Array of backlink objects sorted by DA
 * @throws {Error} If domain is invalid
 */
function generateBacklinkData(domain) {
    try {
        Logger.info(`Generating backlink data for domain: ${domain}`);

        const numberOfBacklinks = randomInt(CONFIG.MIN_BACKLINKS, CONFIG.MAX_BACKLINKS);
        const results = [];
        const usedDomains = new Set();

        for (let i = 0; i < numberOfBacklinks; i++) {
            let sourceDomain;
            do {
                sourceDomain = SAMPLE_DOMAINS[randomInt(0, SAMPLE_DOMAINS.length - 1)];
            } while (usedDomains.has(sourceDomain) && usedDomains.size < SAMPLE_DOMAINS.length);

            usedDomains.add(sourceDomain);

            const isDofollow = Math.random() < CONFIG.DOFOLLOW_PROBABILITY;

            results.push({
                sourceDomain,
                anchorText: ANCHOR_TEXTS[randomInt(0, ANCHOR_TEXTS.length - 1)],
                domainAuthority: randomInt(CONFIG.MIN_DA, CONFIG.MAX_DA),
                type: isDofollow ? 'dofollow' : 'nofollow',
                firstSeen: randomDate()
            });
        }

        // Sort by domain authority descending
        const sortedResults = results.sort((a, b) => b.domainAuthority - a.domainAuthority);

        Logger.info(`Generated ${sortedResults.length} backlinks`, {
            dofollowCount: sortedResults.filter(r => r.type === 'dofollow').length
        });

        return sortedResults;
    } catch (error) {
        Logger.error('Failed to generate backlink data', error);
        throw new Error('Failed to generate backlink data');
    }
}

/* ============================================================================
   STATISTICS & ANIMATION
   Functions for calculating and displaying statistics
   ============================================================================ */

/**
 * Calculates and displays statistics from backlink data
 * @param {Array<Object>} data - Array of backlink objects
 * @returns {void}
 */
function displayStats(data) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            Logger.warn('No data available for statistics display');
            return;
        }

        const totalBacklinks = data.length;
        const uniqueDomains = new Set(data.map(item => item.sourceDomain)).size;
        const avgDA = Math.round(data.reduce((sum, item) => sum + item.domainAuthority, 0) / totalBacklinks);
        const dofollowCount = data.filter(item => item.type === 'dofollow').length;
        const dofollowPercent = Math.round((dofollowCount / totalBacklinks) * 100);

        Logger.debug('Calculated statistics', { totalBacklinks, uniqueDomains, avgDA, dofollowPercent });

        // Animate stats
        animateValue(DOM.totalBacklinks, 0, totalBacklinks, CONFIG.ANIMATION_DURATION);
        animateValue(DOM.referringDomains, 0, uniqueDomains, CONFIG.ANIMATION_DURATION);
        animateValue(DOM.domainAuthority, 0, avgDA, CONFIG.ANIMATION_DURATION);
        animateValue(DOM.dofollowRatio, 0, dofollowPercent, CONFIG.ANIMATION_DURATION, '%');
    } catch (error) {
        Logger.error('Failed to display statistics', error);
        showNotification('Error calculating statistics', 'error');
    }
}

/**
 * Animates a numeric value from start to end with easing
 * @param {HTMLElement} element - Target DOM element
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in ms
 * @param {string} [suffix=''] - Optional suffix (e.g., '%')
 * @returns {void}
 */
function animateValue(element, start, end, duration, suffix = '') {
    if (!element) {
        Logger.warn('Animation target element not found');
        return;
    }

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

/* ============================================================================
   TABLE RENDERING
   Functions for rendering the backlinks results table
   ============================================================================ */

/**
 * Returns the appropriate CSS class based on domain authority score
 * @param {number} da - Domain authority score (0-100)
 * @returns {string} CSS class name for styling
 */
function getDaBadgeClass(da) {
    if (da >= CONFIG.DA_THRESHOLDS.HIGH) return 'da-high';
    if (da >= CONFIG.DA_THRESHOLDS.MEDIUM) return 'da-medium';
    return 'da-low';
}

/**
 * Renders the backlinks table with the provided data
 * @param {Array<Object>} data - Array of backlink objects
 * @returns {void}
 */
function renderBacklinksTable(data) {
    try {
        if (!DOM.backlinksBody) {
            throw new Error('Backlinks table body element not found');
        }

        DOM.backlinksBody.innerHTML = '';

        const filteredData = DOM.onlyDofollow && DOM.onlyDofollow.checked
            ? data.filter(item => item.type === 'dofollow')
            : data;

        Logger.debug(`Rendering ${filteredData.length} rows (filtered from ${data.length})`);

        filteredData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * CONFIG.ROW_ANIMATION_DELAY}s`;
            row.classList.add('fade-in-row');

            // Use escapeHtml for XSS prevention
            row.innerHTML = `
                <td>
                    <span class="domain-link">
                        <i class="fas fa-external-link-alt"></i>
                        ${escapeHtml(item.sourceDomain)}
                    </span>
                </td>
                <td><span class="anchor-text">${escapeHtml(item.anchorText)}</span></td>
                <td>
                    <span class="da-badge ${getDaBadgeClass(item.domainAuthority)}">
                        ${escapeHtml(item.domainAuthority)}
                    </span>
                </td>
                <td>
                    <span class="link-type ${escapeHtml(item.type)}">
                        ${escapeHtml(item.type)}
                    </span>
                </td>
                <td>${escapeHtml(item.firstSeen)}</td>
            `;

            DOM.backlinksBody.appendChild(row);
        });

        Logger.info(`Table rendered with ${filteredData.length} backlinks`);
    } catch (error) {
        Logger.error('Failed to render backlinks table', error);
        showNotification('Error rendering results table', 'error');
    }
}

/* ============================================================================
   MAIN ANALYSIS FUNCTION
   Core business logic for analyzing backlinks
   ============================================================================ */

/**
 * Main analysis function triggered by the Analyze button
 * Validates input, generates data, and displays results
 * @returns {void}
 */
function analyzeBacklinks() {
    try {
        const domain = DOM.domainInput ? DOM.domainInput.value.trim() : '';

        Logger.info(`Analysis requested for domain: "${domain}"`);

        // Input validation
        if (!domain) {
            Logger.warn('Empty domain input');
            showNotification('Please enter a domain to analyze', 'warning');
            if (DOM.domainInput) DOM.domainInput.focus();
            return;
        }

        if (!isValidDomain(domain)) {
            Logger.warn(`Invalid domain format: ${domain}`);
            showNotification('Please enter a valid domain format (e.g., example.com)', 'error');
            if (DOM.domainInput) DOM.domainInput.focus();
            return;
        }

        // Show loading state
        if (DOM.analyzeBtn) {
            DOM.analyzeBtn.disabled = true;
            DOM.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }

        Logger.info('Starting backlink analysis...');

        // Simulate API delay
        setTimeout(() => {
            try {
                currentResults = generateBacklinkData(domain);

                // Update UI visibility
                if (DOM.placeholder) DOM.placeholder.style.display = 'none';
                if (DOM.statsGrid) DOM.statsGrid.style.display = 'grid';

                const tableContainer = document.querySelector('.backlinks-table-container');
                if (tableContainer) tableContainer.style.display = 'block';

                displayStats(currentResults);
                renderBacklinksTable(currentResults);

                // Reset button state
                if (DOM.analyzeBtn) {
                    DOM.analyzeBtn.disabled = false;
                    DOM.analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Backlinks';
                }

                Logger.info(`Analysis complete: Found ${currentResults.length} backlinks for ${domain}`);
                showNotification(`Found ${currentResults.length} backlinks for ${domain}`, 'success');
            } catch (innerError) {
                Logger.error('Error during analysis execution', innerError);
                showNotification('An error occurred during analysis', 'error');

                // Reset button state on error
                if (DOM.analyzeBtn) {
                    DOM.analyzeBtn.disabled = false;
                    DOM.analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Backlinks';
                }
            }
        }, CONFIG.API_DELAY);
    } catch (error) {
        Logger.error('Critical error in analyzeBacklinks', error);
        showNotification('A critical error occurred. Please try again.', 'error');

        // Ensure button is reset on critical error
        if (DOM.analyzeBtn) {
            DOM.analyzeBtn.disabled = false;
            DOM.analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Backlinks';
        }
    }
}

/* ============================================================================
   CSV EXPORT
   Functions for exporting results to CSV format
   ============================================================================ */

/**
 * Exports the current results to CSV format
 * Creates and triggers download of a CSV file
 * @returns {void}
 */
function exportToCSV() {
    try {
        if (!currentResults || currentResults.length === 0) {
            Logger.warn('Export attempted with no data');
            showNotification('No data to export. Run an analysis first.', 'warning');
            return;
        }

        Logger.info(`Exporting ${currentResults.length} results to CSV`);

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
        const filename = `backlink-analysis-${Date.now()}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up object URL
        URL.revokeObjectURL(url);

        Logger.info(`CSV exported successfully: ${filename}`);
        showNotification('CSV exported successfully!', 'success');
    } catch (error) {
        Logger.error('Failed to export CSV', error);
        showNotification('Failed to export CSV. Please try again.', 'error');
    }
}

/* ============================================================================
   NOTIFICATIONS
   Toast notification system for user feedback
   ============================================================================ */

/**
 * Displays a notification toast message
 * @param {string} message - Notification message to display
 * @param {('info'|'success'|'warning'|'error')} [type='info'] - Notification type
 * @returns {void}
 */
function showNotification(message, type = 'info') {
    try {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${escapeHtml(message)}</span>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-remove after configured duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.NOTIFICATION_DURATION);

        Logger.debug(`Notification shown: [${type}] ${message}`);
    } catch (error) {
        Logger.error('Failed to show notification', error);
        // Fallback to alert for critical errors
        if (type === 'error') {
            alert(message);
        }
    }
}

/* ============================================================================
   EVENT LISTENERS
   User interaction handlers
   ============================================================================ */

/**
 * Initializes all event listeners for the application
 * @returns {void}
 */
function initializeEventListeners() {
    // Analyze button click
    if (DOM.analyzeBtn) {
        DOM.analyzeBtn.addEventListener('click', analyzeBacklinks);
        Logger.debug('Analyze button listener attached');
    }

    // Export button click
    if (DOM.exportBtn) {
        DOM.exportBtn.addEventListener('click', exportToCSV);
        Logger.debug('Export button listener attached');
    }

    // Enter key to trigger analysis
    if (DOM.domainInput) {
        DOM.domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeBacklinks();
            }
        });
        Logger.debug('Domain input listener attached');
    }

    // Update table when filter changes
    if (DOM.onlyDofollow) {
        DOM.onlyDofollow.addEventListener('change', () => {
            if (currentResults.length > 0) {
                renderBacklinksTable(currentResults);
            }
        });
        Logger.debug('Dofollow filter listener attached');
    }
}

/* ============================================================================
   INITIALIZATION
   Application startup
   ============================================================================ */

/**
 * Initializes the application on page load
 * Sets up initial UI state and event listeners
 * @returns {void}
 */
function initializeApp() {
    try {
        Logger.info('BacklinkSpy application initializing...');

        // Set initial UI state
        if (DOM.statsGrid) DOM.statsGrid.style.display = 'none';

        const tableContainer = document.querySelector('.backlinks-table-container');
        if (tableContainer) tableContainer.style.display = 'none';

        // Initialize event listeners
        initializeEventListeners();

        Logger.info('BacklinkSpy application initialized successfully');
    } catch (error) {
        Logger.error('Failed to initialize application', error);
        showNotification('Application failed to initialize. Please refresh the page.', 'error');
    }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
