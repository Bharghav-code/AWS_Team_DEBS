import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getCampaignAnalytics } from '../services/analyticsService';

export function useAnalytics(params = {}) {
    return useQuery({
        queryKey: ['analytics', params],
        queryFn: () => getAnalytics(params),
    });
}

export function useCampaignAnalytics(campaignId) {
    return useQuery({
        queryKey: ['analytics', 'campaign', campaignId],
        queryFn: () => getCampaignAnalytics(campaignId),
        enabled: !!campaignId,
    });
}
