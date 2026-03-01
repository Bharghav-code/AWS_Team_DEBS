import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export async function adaptContent(contentData) {
    return apiClient(`${API_ENDPOINTS.CONTENT}/adapt`, {
        method: 'POST',
        body: contentData,
    });
}

export async function getAdaptations(campaignId) {
    return apiClient(`${API_ENDPOINTS.CONTENT}/${campaignId}`);
}
