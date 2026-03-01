import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCampaigns, getCampaignById, createCampaign, updateCampaign, deleteCampaign } from '../services/campaignService';
import { MOCK_CAMPAIGNS } from '../data/mockData';

export function useCampaigns() {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            try {
                const data = await getCampaigns();
                const list = Array.isArray(data) ? data : data?.campaigns || [];
                if (list.length > 0) return data;
            } catch {
                // API unavailable
            }
            return { campaigns: MOCK_CAMPAIGNS };
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
