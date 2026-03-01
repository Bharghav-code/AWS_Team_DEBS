import { useContext } from 'react';
import { CheckCircle } from 'lucide-react';
import { CampaignContext } from '../../context/CampaignContext';
import { formatCurrencyFull } from '../../utils/formatters';

export default function StepReview() {
    const { draft } = useContext(CampaignContext);

    const sections = [
        { label: 'Campaign Name', value: draft.campaignName || '—' },
        { label: 'Budget', value: formatCurrencyFull(draft.budget) },
        { label: 'Goals', value: draft.goals || '—' },
        { label: 'Target Market', value: draft.market || '—' },
        { label: 'Category', value: draft.category || '—' },
        { label: 'Selected Influencers', value: `${(draft.selectedInfluencers || []).length} selected` },
    ];

    return (
        <div className="page-enter">
            <h2 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <CheckCircle size={24} style={{ color: 'var(--color-success)' }} />
                Review & Launch
            </h2>

            <div style={{
                display: 'grid',
                gap: 'var(--space-md)',
            }}>
                {sections.map((s) => (
                    <div key={s.label} className="card" style={{ padding: 'var(--space-md)' }}>
                        <div style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-xs)',
                        }}>
                            {s.label}
                        </div>
                        <div style={{
                            fontSize: 'var(--font-size-body)',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                        }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>

            {draft.content && (
                <div className="card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)' }}>
                    <div style={{
                        fontSize: 'var(--font-size-caption)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-xs)',
                    }}>
                        Content Preview
                    </div>
                    <p style={{
                        fontSize: 'var(--font-size-body)',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                        marginBottom: 0,
                    }}>
                        {draft.content}
                    </p>
                </div>
            )}
        </div>
    );
}
