import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { useCampaign } from '../hooks/useCampaigns';
import { useCampaignAnalytics } from '../hooks/useAnalytics';
import Chart from '../components/common/Chart';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrencyFull, formatNumber, formatPercentage, formatDate } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

export default function CampaignDetailsPage() {
    const { id } = useParams();
    const { data: campaign, isLoading } = useCampaign(id);
    const { data: analytics } = useCampaignAnalytics(id);

    if (isLoading) {
        return (
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
                <LoadingSkeleton lines={8} />
            </div>
        );
    }

    const c = campaign || {};
    const chartData = analytics?.daily || [
        { name: 'Day 1', reach: 2000, engagement: 120 },
        { name: 'Day 2', reach: 3500, engagement: 210 },
        { name: 'Day 3', reach: 5200, engagement: 340 },
        { name: 'Day 4', reach: 7100, engagement: 480 },
        { name: 'Day 5', reach: 8800, engagement: 590 },
    ];

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <Link to={ROUTES.DASHBOARD} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)', textDecoration: 'none' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>{c.name || c.campaignName || 'Campaign Details'}</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                        {c.status && <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-xs) var(--space-sm)',
                            background: c.status === 'active' ? 'rgba(207, 157, 123, 0.15)' : 'rgba(114, 75, 57, 0.2)',
                            color: c.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-caption)',
                            fontWeight: 600,
                        }}>
                            <Activity size={12} /> {c.status}
                        </span>}
                        {c.createdAt && <span style={{ marginLeft: 'var(--space-sm)' }}>Created {formatDate(c.createdAt)}</span>}
                    </p>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                {[
                    { label: 'Budget', value: formatCurrencyFull(c.budget || 0) },
                    { label: 'Reach', value: formatNumber(c.reach || 0) },
                    { label: 'Engagement', value: formatPercentage(c.engagement || 0) },
                    { label: 'Spent', value: formatCurrencyFull(c.spent || 0) },
                ].map((m) => (
                    <div key={m.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
                        <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>{m.label}</div>
                        <div style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700 }}>{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Performance</h2>
                <Chart type="line" data={chartData} dataKeys={['reach', 'engagement']} height={300} />
            </div>

            {/* Details */}
            {(c.goals || c.market || c.category) && (
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Details</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                        {c.goals && <div><strong>Goals:</strong> {c.goals}</div>}
                        {c.market && <div><strong>Market:</strong> {c.market}</div>}
                        {c.category && <div><strong>Category:</strong> {c.category}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
