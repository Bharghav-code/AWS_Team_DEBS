import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useInfluencers } from '../hooks/useInfluencers';
import InfluencerCard from '../components/common/InfluencerCard';
import BudgetSlider from '../components/common/BudgetSlider';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { MARKETS, BUDGET } from '../utils/constants';

export default function InfluencersPage() {
    const [market, setMarket] = useState('');
    const [search, setSearch] = useState('');
    const [maxBudget, setMaxBudget] = useState(BUDGET.MAX);

    const params = {};
    if (market) params.market = market;

    const { data, isLoading } = useInfluencers(params);
    const influencers = Array.isArray(data) ? data : data?.influencers || [];

    const filtered = influencers.filter((inf) => {
        if (inf.cost > maxBudget) return false;
        if (search) {
            const q = search.toLowerCase();
            return (inf.handle || '').toLowerCase().includes(q) || (inf.niche || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <h1 style={{ marginBottom: 'var(--space-lg)' }}>Influencer Marketplace</h1>

            {/* Filters */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input type="text" placeholder="Search influencers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
                    </div>
                    <select value={market} onChange={(e) => setMarket(e.target.value)} style={{ width: '160px', background: 'var(--color-jungle-green)', color: 'var(--color-brass)', border: '1px solid var(--color-border-medium)' }}>
                        <option value="">All States</option>
                        {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <BudgetSlider steps={BUDGET.STEPS} value={maxBudget} onChange={setMaxBudget} />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-muted)' }}>
                    <SlidersHorizontal size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                    <p>No influencers found. Try adjusting your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
                    {filtered.map((inf, i) => (
                        <InfluencerCard key={inf.id || i} influencer={inf} isWithinBudget={inf.cost <= maxBudget} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
