import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, Pause, FileText, Activity, Users, BarChart3, DollarSign } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useTrends } from '../hooks/useTrends';
import { useAuth } from '../hooks/useAuth';
import Chart from '../components/common/Chart';
import { MetricSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { ROUTES, CAMPAIGN_STATUS } from '../utils/constants';

const statusIcons = {
    [CAMPAIGN_STATUS.ACTIVE]: { icon: '●', color: 'var(--color-success)' },
    [CAMPAIGN_STATUS.PAUSED]: { icon: '⏸', color: 'var(--color-warning)' },
    [CAMPAIGN_STATUS.DRAFT]: { icon: '📝', color: 'var(--color-text-muted)' },
    [CAMPAIGN_STATUS.COMPLETED]: { icon: '✓', color: 'var(--color-professional-blue)' },
};

const performanceData = [
    { name: 'Week 1', reach: 12000, engagement: 450 },
    { name: 'Week 2', reach: 19000, engagement: 780 },
    { name: 'Week 3', reach: 28000, engagement: 1200 },
    { name: 'Week 4', reach: 35000, engagement: 1580 },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: campaignData, isLoading: campaignsLoading } = useCampaigns();
    const { data: trendData, isLoading: trendsLoading } = useTrends();

    const campaigns = Array.isArray(campaignData) ? campaignData : campaignData?.campaigns || [];
    const trends = Array.isArray(trendData) ? trendData : trendData?.trends || [];

    const activeCampaigns = campaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE).length;
    const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);
    const avgEngagement = campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + (c.engagement || 0), 0) / campaigns.length
        : 0;
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);

    const metrics = [
        { label: 'Active Campaigns', value: activeCampaigns, icon: Activity },
        { label: 'Total Reach', value: formatNumber(totalReach), icon: Users },
        { label: 'Avg Engagement', value: formatPercentage(avgEngagement), icon: BarChart3 },
        { label: 'Budget Spent', value: formatCurrency(totalSpent), icon: DollarSign },
    ];

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                        Welcome back{user?.name ? `, ${user.name}` : ''}
                    </p>
                </div>
                <Link to={ROUTES.CREATE_CAMPAIGN} className="btn-primary" id="btn-generate-campaign" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    textDecoration: 'none',
                    background: 'var(--color-coffee)',
                    color: 'var(--color-brass)',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                }}>
                    <PlusCircle size={18} /> Create Campaign
                </Link>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                {campaignsLoading ? (
                    [1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)
                ) : (
                    metrics.map((m) => (
                        <div key={m.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <m.icon size={24} style={{ color: 'var(--color-professional-blue)', marginBottom: 'var(--space-sm)' }} />
                            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>{m.label}</div>
                            <div style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.value}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }} className="dashboard-grid">
                {/* Campaign List */}
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Recent Campaigns</h2>
                    {campaignsLoading ? (
                        <CardSkeleton />
                    ) : campaigns.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                            No campaigns yet. Create your first campaign!
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {campaigns.slice(0, 5).map((c) => {
                                const st = statusIcons[c.status] || statusIcons.draft;
                                return (
                                    <Link
                                        key={c.id || c.campaignId}
                                        to={`/campaigns/${c.id || c.campaignId}`}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 'var(--space-md)',
                                            background: 'var(--color-light-gray)',
                                            borderRadius: 'var(--radius-md)',
                                            textDecoration: 'none',
                                            color: 'var(--color-text-primary)',
                                            transition: 'background var(--transition-base)',
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{c.name || c.campaignName || 'Untitled'}</span>
                                        <span style={{ color: st.color, fontSize: 'var(--font-size-caption)' }}>
                                            {st.icon} {c.status}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Trends Panel */}
                <div className="card" style={{ padding: 'var(--space-lg)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <TrendingUp size={20} /> Trending
                    </h2>
                    {trendsLoading ? (
                        <CardSkeleton />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {(trends.slice(0, 4) || []).map((t, i) => (
                                <div key={t.id || i} style={{
                                    padding: 'var(--space-sm)',
                                    background: 'var(--color-light-gray)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--font-size-caption)',
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>{t.name}</div>
                                    <div style={{ color: 'var(--color-text-muted)' }}>{t.badge || t.category}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Performance (30 Days)</h2>
                <Chart
                    type="area"
                    data={performanceData}
                    dataKeys={['reach', 'engagement']}
                    height={280}
                />
            </div>

            <style>{`
        @media (max-width: 767px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
