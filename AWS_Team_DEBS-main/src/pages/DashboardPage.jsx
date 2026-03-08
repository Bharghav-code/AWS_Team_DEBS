import { Link } from 'react-router-dom';
import { PlusCircle, TrendingUp, Activity, Users, BarChart3, DollarSign, BarChart2, Rocket } from 'lucide-react';
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
                        <div style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)' }}>
                            <div style={{
                                background: 'var(--color-light-gray)',
                                width: '64px', height: '64px',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto var(--space-md)'
                            }}>
                                <Rocket size={32} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>No campaigns yet</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                                You haven't created any marketing campaigns. Click the button above to launch your first one!
                            </p>
                        </div>
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
                            {trends.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>
                                    Launch a campaign to discover relevant market trends.
                                </p>
                            ) : (
                                (trends.slice(0, 4)).map((t, i) => (
                                    <div key={t.id || i} style={{
                                        padding: 'var(--space-sm)',
                                        background: 'var(--color-light-gray)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: 'var(--font-size-caption)',
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '2px' }}>{t.name}</div>
                                        <div style={{ color: 'var(--color-text-muted)' }}>{t.badge || t.category}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Performance (30 Days)</h2>
                {campaigns.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-muted)' }}>
                        <BarChart2 size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.4 }} />
                        <h3>Awaiting Data</h3>
                        <p style={{ maxWidth: '400px', margin: '0 auto var(--space-lg)' }}>We actively track your campaign reach and engagement metrics here. Create your first campaign to get started.</p>
                        <Link to={ROUTES.CREATE_CAMPAIGN} className="btn-primary" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none',
                            background: 'var(--color-coffee)', color: 'var(--color-brass)', padding: '10px 20px', borderRadius: 'var(--radius-md)'
                        }}>
                            <PlusCircle size={18} /> First Campaign
                        </Link>
                    </div>
                ) : (
                    <Chart
                        type="area"
                        data={campaigns.slice(0, 4).map((c, i) => ({
                            name: c.name || c.campaignName || `Campaign ${i + 1}`,
                            reach: Number(c.reach) || 0,
                            engagement: Number(c.engagement) || 0,
                        }))}
                        dataKeys={['reach', 'engagement']}
                        height={280}
                    />
                )}
            </div>

            <style>{`
        @media (max-width: 767px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
