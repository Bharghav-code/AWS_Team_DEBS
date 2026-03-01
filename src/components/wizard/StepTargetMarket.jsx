import { useContext } from 'react';
import { CampaignContext } from '../../context/CampaignContext';
import { MARKETS, CATEGORIES } from '../../utils/constants';

function formatBudgetLabel(value) {
    if (!value) return '—';
    if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return `₹${value}`;
}

export default function StepTargetMarket() {
    const { draft, updateDraft } = useContext(CampaignContext);

    const selectedStateName = MARKETS.find((m) => m.id === draft.market)?.name;

    return (
        <div className="page-enter">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Target State &amp; Category</h2>

            {/* Selected budget display */}
            <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-jet)',
                border: '1px solid var(--color-border-light)',
                marginBottom: 'var(--space-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-label)' }}>
                    Selected Budget
                </span>
                <span style={{ color: 'var(--color-brass)', fontSize: 'var(--font-size-h3)', fontWeight: 700 }}>
                    {formatBudgetLabel(draft.budget)}
                </span>
            </div>

            {/* State — Dropdown */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label htmlFor="state-select">Select State</label>
                <select
                    id="state-select"
                    value={draft.market || ''}
                    onChange={(e) => updateDraft({ market: e.target.value })}
                    style={{
                        width: '100%',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-medium)',
                        background: 'var(--color-white)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-body)',
                        cursor: 'pointer',
                    }}
                >
                    <option value="" disabled>Choose a state…</option>
                    {MARKETS.map((market) => (
                        <option key={market.id} value={market.id}>
                            {market.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category — button chips */}
            <div>
                <label>Select Category</label>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-sm)',
                }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => updateDraft({ category: cat })}
                            style={{
                                padding: 'var(--space-sm) var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${draft.category === cat ? 'var(--color-professional-blue)' : 'var(--color-border-light)'}`,
                                background: draft.category === cat ? 'var(--color-jet)' : 'var(--color-white)',
                                color: draft.category === cat ? 'var(--color-professional-blue)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-label)',
                                fontWeight: draft.category === cat ? 600 : 400,
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
