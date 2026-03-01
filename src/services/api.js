import { API_CONFIG } from '../utils/constants';

let fallbackData = {};

/**
 * Load all fallback JSON files into memory on app init
 */
export async function loadFallbackData() {
    const files = [
        'fallback-trends',
        'fallback-influencers',
        'fallback-campaigns',
        'fallback-analytics',
        'fallback-adaptations',
    ];

    await Promise.all(
        files.map(async (file) => {
            try {
                const res = await fetch(`/data/${file}.json`);
                if (res.ok) {
                    fallbackData[file] = await res.json();
                }
            } catch {
                // Silently ignore — fallback data not available
            }
        })
    );
}

/**
 * Get fallback data for a given endpoint path
 */
function getFallbackForEndpoint(path) {
    if (path.includes('/trends')) return fallbackData['fallback-trends'];
    if (path.includes('/influencers')) return fallbackData['fallback-influencers'];
    if (path.includes('/campaigns')) return fallbackData['fallback-campaigns'];
    if (path.includes('/analytics')) return fallbackData['fallback-analytics'];
    if (path.includes('/content')) return fallbackData['fallback-adaptations'];
    return null;
}

/**
 * Queue a write operation to localStorage for later sync
 */
function queueWriteOperation(method, path, body) {
    try {
        const queue = JSON.parse(localStorage.getItem('virale_write_queue') || '[]');
        queue.push({
            method,
            path,
            body,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('virale_write_queue', JSON.stringify(queue));
    } catch {
        // localStorage might be full or unavailable
    }
}

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
    try {
        const session = localStorage.getItem('virale_session');
        if (session) {
            const parsed = JSON.parse(session);
            return parsed.idToken;
        }
    } catch {
        // Ignore
    }
    return null;
}

/**
 * Core API client with silent fallback system:
 * 1. Tries API call with Authorization header
 * 2. Retries up to 2 times on failure (5s timeout each)
 * 3. On failure, silently returns fallback data
 * 4. Write operations are queued in localStorage
 */
export async function apiClient(path, options = {}) {
    const { method = 'GET', body, headers = {}, requiresAuth = true } = options;
    const url = `${API_CONFIG.BASE_URL}${path}`;

    const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (requiresAuth) {
        const token = getAuthToken();
        if (token) {
            requestHeaders['Authorization'] = token;
        }
    }

    const fetchOptions = {
        method,
        headers: requestHeaders,
        ...(body && { body: JSON.stringify(body) }),
    };

    // Retry logic: try up to 3 times (initial + 2 retries)
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < 2) continue; // Retry

            // All retries exhausted — use fallback for reads, queue for writes
            if (method === 'GET') {
                const fallback = getFallbackForEndpoint(path);
                if (fallback) return fallback;
            } else {
                queueWriteOperation(method, path, body);
                return { success: true, queued: true };
            }

            throw error;
        }
    }
}

export default apiClient;
