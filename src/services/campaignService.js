import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export async function getCampaigns() {
    return apiClient(API_ENDPOINTS.CAMPAIGNS);
}

export async function getCampaignById(id) {
    return apiClient(`${API_ENDPOINTS.CAMPAIGNS}/${id}`);
}

export async function createCampaign(campaignData) {
    return apiClient(API_ENDPOINTS.CAMPAIGNS, {
        method: 'POST',
        body: campaignData,
    });
}

export async function updateCampaign(id, campaignData) {
    return apiClient(`${API_ENDPOINTS.CAMPAIGNS}/${id}`, {
        method: 'PUT',
        body: campaignData,
    });
}

export async function deleteCampaign(id) {
    return apiClient(`${API_ENDPOINTS.CAMPAIGNS}/${id}`, {
        method: 'DELETE',
    });
}
