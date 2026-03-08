import { useContext } from 'react';
import { CampaignContext } from '../../context/CampaignContext';
import { useInfluencers } from '../../hooks/useInfluencers';
import InfluencerCard from '../common/InfluencerCard';
import { CardSkeleton } from '../common/LoadingSkeleton';

export default function StepInfluencers() {
    const { draft, updateDraft } = useContext(CampaignContext);
    const { data, isLoading } = useInfluencers({ market: draft.market });

    const influencers = Array.isArray(data) ? data : data?.influencers || [];

    const toggleInfluencer = (id) => {
        const selected = draft.selectedInfluencers || [];
        if (selected.includes(id)) {
            updateDraft({ selectedInfluencers: selected.filter((i) => i !== id) });
        } else {
            updateDraft({ selectedInfluencers: [...selected, id] });
        }
    };

    return (
        <div className="page-enter">
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>Select Influencers</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                Choose influencers that fit your budget of ₹{draft.budget?.toLocaleString('en-IN')}
            </p>

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
                    {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
                    {influencers.map((inf, idx) => {
                        const isSelected = (draft.selectedInfluencers || []).includes(inf.id);
                        return (
                            <div
                                key={inf.id}
                                onClick={() => toggleInfluencer(inf.id)}
                                style={{
                                    cursor: 'pointer',
                                    border: isSelected ? '2px solid var(--color-professional-blue)' : '2px solid transparent',
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'border-color var(--transition-base)',
                                }}
                            >
                                <InfluencerCard
                                    influencer={inf}
                                    isWithinBudget={inf.cost <= draft.budget}
                                    index={idx}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {(draft.selectedInfluencers || []).length > 0 && (
                <p style={{
                    marginTop: 'var(--space-md)',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                    marginBottom: 0,
                }}>
                    {(draft.selectedInfluencers || []).length} influencer(s) selected
                </p>
            )}
        </div>
    );
}
