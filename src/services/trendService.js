import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export async function getTrends(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${API_ENDPOINTS.TRENDS}?${query}` : API_ENDPOINTS.TRENDS;
    return apiClient(path);
}

export async function getTrendById(id) {
    return apiClient(`${API_ENDPOINTS.TRENDS}/${id}`);
}
