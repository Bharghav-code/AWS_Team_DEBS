import { useQuery } from '@tanstack/react-query';
import { getInfluencers } from '../services/influencerService';
import { MOCK_INFLUENCERS } from '../data/mockData';

export function useInfluencers(params = {}) {
    return useQuery({
        queryKey: ['influencers', params],
        queryFn: async () => {
            try {
                const data = await getInfluencers(params);
                const list = Array.isArray(data) ? data : data?.influencers || [];
                if (list.length > 0) return data;
            } catch {
                // API unavailable — fall through to mock
            }
            // Return mock data in expected format
            return { influencers: MOCK_INFLUENCERS };
        },
    });
}
