import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdaptations, adaptContent } from '../services/contentService';

export function useAdaptations(campaignId) {
    return useQuery({
        queryKey: ['adaptations', campaignId],
        queryFn: async () => {
            if (!campaignId) return { adaptations: [] };
            try {
                const data = await getAdaptations(campaignId);
                if (data?.adaptations) return data;
                if (Array.isArray(data)) return { adaptations: data };
            } catch {
                // API unavailable
            }
            return { adaptations: [] };
        },
        enabled: !!campaignId,
    });
}

export function useAdaptContent(campaignId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => adaptContent({ ...payload, campaignId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adaptations', campaignId] });
        },
    });
}
