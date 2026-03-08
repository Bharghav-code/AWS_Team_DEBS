import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } from '../services/campaignService';

export function useCampaigns() {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            try {
                const data = await getCampaigns();
                // Always return real data (even if empty) — never fall back to mocks
                if (Array.isArray(data)) return { campaigns: data };
                if (data && typeof data === 'object') return { campaigns: data.campaigns || [] };
            } catch {
                // API unavailable — return empty list so new users see 0 campaigns
            }
            return { campaigns: [] };
        },
    });
}

export function useCampaign(id) {
    return useQuery({
        queryKey: ['campaigns', id],
        queryFn: () => getCampaignById(id),
        enabled: !!id,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateCampaign(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCampaign,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
}
