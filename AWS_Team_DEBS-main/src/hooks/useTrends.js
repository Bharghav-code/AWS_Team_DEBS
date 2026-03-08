import { useQuery } from '@tanstack/react-query';
import { getTrends } from '../services/trendService';
import { MOCK_TRENDS } from '../data/mockData';

export function useTrends(params = {}) {
    return useQuery({
        queryKey: ['trends', params],
        queryFn: async () => {
            try {
                const data = await getTrends(params);
                const list = Array.isArray(data) ? data : data?.trends || [];
                if (list.length > 0) return data;
            } catch {
                // API unavailable — fall through to mock
            }
            // Return mock data in expected format
            return { trends: MOCK_TRENDS };
        },
    });
}
