import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export async function getAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${API_ENDPOINTS.ANALYTICS}?${query}` : API_ENDPOINTS.ANALYTICS;
    return apiClient(path);
}

export async function getCampaignAnalytics(campaignId) {
    return apiClient(`${API_ENDPOINTS.ANALYTICS}/${campaignId}`);
}

export async function exportAnalytics(params = {}) {
    return apiClient(`${API_ENDPOINTS.ANALYTICS}/export`, {
        method: 'POST',
        body: params,
    });
}
