import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useTrends } from '../hooks/useTrends';
import TrendCard from '../components/common/TrendCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { MARKETS, CATEGORIES } from '../utils/constants';

export default function TrendsPage() {
    const [market, setMarket] = useState('');
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');

    const params = {};
    if (market) params.market = market;
    if (category) params.category = category;

    const { data, isLoading } = useTrends(params);
    const trends = Array.isArray(data) ? data : data?.trends || [];

    const filtered = trends.filter((t) => {
        if (search) {
            const q = search.toLowerCase();
            return (t.name || '').toLowerCase().includes(q) || (t.badge || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <h1 style={{ marginBottom: 'var(--space-lg)' }}>Trend Explorer</h1>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)',
                flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: '1 1 250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search trends..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>

                <select value={market} onChange={(e) => setMarket(e.target.value)} style={{ width: '160px', background: 'var(--color-jungle-green)', color: 'var(--color-brass)', border: '1px solid var(--color-border-medium)' }}>
                    <option value="">All States</option>
                    {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>

                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: '0 0 160px' }}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Trend Grid */}
            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-muted)' }}>
                    <Filter size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                    <p>No trends found. Try adjusting your filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                    {filtered.map((trend, i) => (
                        <TrendCard key={trend.id || i} trend={trend} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
