import { useQuery } from '@tanstack/react-query';
import { getInfluencers } from '../services/influencerService';
import { MOCK_INFLUENCERS } from '../data/mockData';

/**
 * Compute a trendAlignment score for an influencer (0-100).
 * Formula: base 40 + up to 30 from engagementRate + up to 30 from followers.
 */
function computeTrendAlignment(inf) {
    if (inf.trendAlignment != null) return inf.trendAlignment;
    const rate = parseFloat(inf.engagementRate || inf.engagement || 0);
    const followers = parseInt(inf.followers || 0, 10);
    const engScore = Math.min(30, Math.round(rate * 2));
    const followerScore = Math.min(30, Math.round(followers / 10000));
    return Math.min(100, 40 + engScore + followerScore);
}

function enrichAndSort(list) {
    return list
        .map((inf) => ({ ...inf, trendAlignment: computeTrendAlignment(inf) }))
        .sort((a, b) => b.trendAlignment - a.trendAlignment);
}

export function useInfluencers(params = {}) {
    return useQuery({
        queryKey: ['influencers', params],
        queryFn: async () => {
            try {
                const data = await getInfluencers(params);
                const list = Array.isArray(data) ? data : data?.influencers || [];
                if (list.length > 0) {
                    return { influencers: enrichAndSort(list) };
                }
            } catch {
                // API unavailable — fall through
            }
            // Use mock data filtered by market if requested
            const market = params.market || '';
            let mocks = MOCK_INFLUENCERS;
            if (market) {
                mocks = mocks.filter((inf) => inf.market === market || inf.market === 'india');
            }
            return { influencers: enrichAndSort(mocks) };
        },
    });
}
