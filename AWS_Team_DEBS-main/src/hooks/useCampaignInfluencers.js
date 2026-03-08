import { useInfluencers } from './useInfluencers';

/**
 * Returns influencers filtered by the campaign's target market/state,
 * sorted descending by trendAlignment score.
 */
export function useCampaignInfluencers(market) {
    return useInfluencers(market ? { market } : {});
}
