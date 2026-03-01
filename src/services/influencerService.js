import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export async function getInfluencers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `${API_ENDPOINTS.INFLUENCERS}?${query}` : API_ENDPOINTS.INFLUENCERS;
    return apiClient(path);
}

export async function getInfluencerById(id) {
    return apiClient(`${API_ENDPOINTS.INFLUENCERS}/${id}`);
}
