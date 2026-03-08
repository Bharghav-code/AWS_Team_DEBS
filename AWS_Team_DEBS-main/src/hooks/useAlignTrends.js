import { useQuery } from '@tanstack/react-query';
import { alignTrends } from '../services/contentService';

export function useAlignTrends(campaignId, goals, trends) {
    return useQuery({
        // We include goals and trend IDs in the key so it re-fetches if they change
        queryKey: ['alignedTrends', campaignId, goals, trends?.map(t => t.id).join(',')],
        queryFn: async () => {
            if (!goals || !trends || trends.length === 0) {
                return { scores: {} };
            }
            try {
                const data = await alignTrends({ goals, trends });
                return data;
            } catch {
                return { scores: {} };
            }
        },
        enabled: !!goals && !!trends?.length,
        staleTime: 1000 * 60 * 60, // 1 hour (save bedrock calls)
    });
}
