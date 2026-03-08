import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp, Users, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useCampaign, useCampaigns, useUpdateCampaign } from '../hooks/useCampaigns';
import { useCampaignAnalytics } from '../hooks/useAnalytics';
import { useCampaignInfluencers } from '../hooks/useCampaignInfluencers';
import { useTrends } from '../hooks/useTrends';
import { useAlignTrends } from '../hooks/useAlignTrends';
import { useAdaptations, useAdaptContent } from '../hooks/useAdaptations';
import Chart from '../components/common/Chart';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatCurrencyFull, formatNumber, formatPercentage, formatDate } from '../utils/formatters';
import { ROUTES, MARKETS } from '../utils/constants';

/* ── Trend badge colours ── */
function AlignmentBadge({ value }) {
    const pct = Number(value || 0);
    const color = pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#9e9e9e';
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '999px',
            background: `${color}22`,
            color,
            fontWeight: 700,
            fontSize: '0.75rem',
        }}>
            {pct}% aligned
        </span>
    );
}

/* ── Inline AI adaptation form ── */
function InlineAdapt({ campaignId, campaignMarket }) {
    const [market, setMarket] = useState(campaignMarket || '');
    const [content, setContent] = useState('');
    const [result, setResult] = useState(null);
    const adaptMutation = useAdaptContent(campaignId);

    const handleAdapt = () => {
        adaptMutation.mutate(
            { content, market, category: '' },
            { onSuccess: (data) => setResult(data) }
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                style={{ background: 'var(--color-jungle-green)', color: 'var(--color-brass)', border: '1px solid var(--color-border-medium)' }}
            >
                <option value="">Select State</option>
                {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <textarea
                rows={4}
                placeholder="Enter content to adapt for the selected state…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
            />
            <button
                type="button"
                className="btn-primary"
                disabled={!content || !market || adaptMutation.isPending}
                onClick={handleAdapt}
                style={{ alignSelf: 'flex-start' }}
            >
                {adaptMutation.isPending
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Adapting…</>
                    : <><Sparkles size={16} /> Adapt with AI</>}
            </button>
            {result && (
                <div className="card" style={{ padding: 'var(--space-md)', background: 'var(--color-jet)' }}>
                    <strong style={{ color: 'var(--color-brass)', display: 'block', marginBottom: 'var(--space-xs)' }}>
                        AI-Adapted ({MARKETS.find(m => m.id === market)?.name || market}):
                    </strong>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)', marginBottom: 0 }}>
                        {result.adaptedContent || result.content}
                    </p>
                </div>
            )}
            {adaptMutation.isError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>Adaptation failed — please try again.</p>
            )}
        </div>
    );
}

/* ── Collapsible adaptation history card ── */
function AdaptationCard({ adaptation }) {
    const [open, setOpen] = useState(false);
    const marketName = MARKETS.find(m => m.id === adaptation.market)?.name || adaptation.market;
    return (
        <div className="card" style={{ padding: 'var(--space-md)', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{marketName}</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {open && (
                <p style={{ marginTop: 'var(--space-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {adaptation.adaptedContent || adaptation.content}
                </p>
            )}
        </div>
    );
}

export default function CampaignDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: campaign, isLoading } = useCampaign(id);
    const { data: analyticsData } = useCampaignAnalytics(id);
    const { data: allCampaignsData } = useCampaigns();
    const updateMutation = useUpdateCampaign();

    const c = campaign || {};
    const campaignMarket = c.market || '';

    const { data: influencerData, isLoading: infLoading } = useCampaignInfluencers(campaignMarket);
    const { data: trendData, isLoading: trendLoading } = useTrends(campaignMarket ? { market: campaignMarket } : {});

    const allFetchedTrends = Array.isArray(trendData) ? trendData : trendData?.trends || [];
    const { data: alignData, isLoading: alignLoading } = useAlignTrends(id, c.goals, allFetchedTrends);

    const { data: adaptationsData } = useAdaptations(id);

    const [showAdaptForm, setShowAdaptForm] = useState(false);

    // Campaign selector
    const allCampaigns = Array.isArray(allCampaignsData)
        ? allCampaignsData
        : allCampaignsData?.campaigns || [];

    const influencers = (Array.isArray(influencerData) ? influencerData : influencerData?.influencers || [])
        .slice(0, 6);  // top 6

    const trends = allFetchedTrends
        .map(t => {
            const dynamicScore = alignData?.scores?.[t.id || t.trendId];
            return {
                ...t,
                alignmentPercentage: dynamicScore !== undefined ? dynamicScore : (t.alignmentPercentage || 0)
            };
        })
        .sort((a, b) => (b.alignmentPercentage || 0) - (a.alignmentPercentage || 0))
        .slice(0, 6);

    const adaptations = Array.isArray(adaptationsData)
        ? adaptationsData
        : adaptationsData?.adaptations || [];

    const chartData = analyticsData?.daily || [
        { name: 'Day 1', reach: 0, engagement: 0 },
        { name: 'Day 2', reach: 0, engagement: 0 },
        { name: 'Day 3', reach: 0, engagement: 0 },
        { name: 'Day 4', reach: 0, engagement: 0 },
        { name: 'Day 5', reach: 0, engagement: 0 },
    ];

    if (isLoading) {
        return (
            <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
                <LoadingSkeleton lines={8} />
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>

            {/* Back + Campaign Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <Link to={ROUTES.DASHBOARD} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                {allCampaigns.length > 1 && (
                    <select
                        value={id}
                        onChange={(e) => navigate(`/campaigns/${e.target.value}`)}
                        style={{
                            marginLeft: 'auto',
                            background: 'var(--color-jet)',
                            color: 'var(--color-brass)',
                            border: '1px solid var(--color-border-medium)',
                            borderRadius: 'var(--radius-md)',
                            padding: '8px 12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {allCampaigns.map((camp) => (
                            <option key={camp.id || camp.campaignId} value={camp.id || camp.campaignId}>
                                {camp.name || camp.campaignName || 'Untitled'}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <h1 style={{ marginBottom: 0 }}>{c.name || c.campaignName || 'Campaign Details'}</h1>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)', marginBottom: 0 }}>
                        {c.status && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)',
                                padding: 'var(--space-xs) var(--space-sm)',
                                background: c.status === 'active' ? 'rgba(76,175,80,0.15)' : c.status === 'cancelled' ? 'rgba(255,0,0,0.15)' : 'rgba(114,75,57,0.2)',
                                color: c.status === 'active' ? 'var(--color-success)' : c.status === 'cancelled' ? '#f44336' : 'var(--color-warning)',
                                borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-caption)', fontWeight: 600,
                            }}>
                                <Activity size={12} /> {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                            </span>
                        )}
                        {c.market && (
                            <span style={{ marginLeft: 'var(--space-sm)', fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
                                📍 {MARKETS.find(m => m.id === c.market)?.name || c.market}
                            </span>
                        )}
                        {c.createdAt && <span style={{ marginLeft: 'var(--space-sm)' }}>Created {formatDate(c.createdAt)}</span>}
                    </p>
                </div>

                {/* Lifecycle Buttons */}
                {c.status && c.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        {c.status === 'active' && (
                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={updateMutation.isPending}
                                onClick={() => updateMutation.mutate({ id: c.campaignId || c.id, data: { status: 'paused' } })}
                                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                            >
                                {updateMutation.isPending ? 'Pausing...' : 'Pause Campaign'}
                            </button>
                        )}
                        {c.status === 'paused' && (
                            <button
                                type="button"
                                className="btn-primary"
                                disabled={updateMutation.isPending}
                                onClick={() => updateMutation.mutate({ id: c.campaignId || c.id, data: { status: 'active' } })}
                                style={{ padding: '6px 14px', fontSize: '0.85rem', background: 'var(--color-success)' }}
                            >
                                {updateMutation.isPending ? 'Resuming...' : 'Resume Campaign'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn-secondary"
                            disabled={updateMutation.isPending}
                            onClick={() => {
                                if (window.confirm("Are you sure you want to cancel this campaign? It cannot be restarted.")) {
                                    updateMutation.mutate({ id: c.campaignId || c.id, data: { status: 'cancelled' } });
                                }
                            }}
                            style={{ padding: '6px 14px', fontSize: '0.85rem', color: '#f44336', borderColor: '#f44336' }}
                        >
                            {updateMutation.isPending ? 'Cancelling...' : 'Cancel Campaign'}
                        </button>
                    </div>
                )}
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

            {/* Performance Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Performance</h2>
                <Chart type="line" data={chartData} dataKeys={['reach', 'engagement']} height={260} />
            </div>

            {/* Details */}
            {(c.goals || c.market || c.category) && (
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Details</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                        {c.goals && <div><strong>Goals:</strong> {c.goals}</div>}
                        {c.market && <div><strong>Target State:</strong> {MARKETS.find(m => m.id === c.market)?.name || c.market}</div>}
                        {c.category && <div><strong>Category:</strong> {c.category}</div>}
                    </div>
                </div>
            )}

            {/* ── Top Influencers for this Campaign ── */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <Users size={20} />
                    Top Influencers
                    {campaignMarket && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                            — {MARKETS.find(m => m.id === campaignMarket)?.name || campaignMarket}
                        </span>
                    )}
                </h2>
                {infLoading ? (
                    <LoadingSkeleton lines={3} />
                ) : influencers.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                        {campaignMarket ? 'No influencers found for this state.' : 'Launch a campaign with a target state to see influencers.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {influencers.map((inf, idx) => (
                            <div key={inf.id || idx} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: 'var(--space-md)', background: 'var(--color-light-gray)',
                                borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: 'var(--space-sm)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'var(--color-professional-blue)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: '#fff',
                                        fontWeight: 700, flexShrink: 0,
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{inf.name || inf.handle}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                            {inf.handle || ''} · {(inf.followers || 0).toLocaleString('en-IN')} followers
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                        {parseFloat(inf.engagementRate || inf.engagement || 0).toFixed(1)}% eng
                                    </span>
                                    <AlignmentBadge value={inf.trendAlignment} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Top Trends for this Campaign ── */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                    <TrendingUp size={20} />
                    Top Trends
                    {campaignMarket && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                            — {MARKETS.find(m => m.id === campaignMarket)?.name || campaignMarket}
                        </span>
                    )}
                </h2>
                {(trendLoading || alignLoading) ? (
                    <LoadingSkeleton lines={3} />
                ) : trends.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                        {campaignMarket ? 'No trends found for this state.' : 'Launch a campaign with a target state to see trends.'}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {trends.map((t, idx) => (
                            <div key={t.id || idx} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: 'var(--space-md)', background: 'var(--color-light-gray)',
                                borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: 'var(--space-sm)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'var(--color-jungle-green)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--color-brass)',
                                        fontWeight: 700, flexShrink: 0,
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                            {t.badge || t.category} {t.timing ? `· ${t.timing}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <AlignmentBadge value={t.alignmentPercentage} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── AI Content Adaptations ── */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 0 }}>
                        <Sparkles size={20} /> AI Content Adaptations
                    </h2>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setShowAdaptForm(f => !f)}
                        style={{ background: 'var(--color-coffee)', color: 'var(--color-brass)', fontSize: '0.85rem', padding: '8px 16px' }}
                    >
                        {showAdaptForm ? 'Hide Form' : '+ Adapt for State'}
                    </button>
                </div>

                {showAdaptForm && (
                    <div style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-light-gray)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Generate New Adaptation</h3>
                        <InlineAdapt campaignId={id} campaignMarket={campaignMarket} />
                    </div>
                )}

                {adaptations.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-lg)' }}>
                        No adaptations yet. Click "Adapt for State" to generate AI-localised content.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {adaptations.map((a, i) => (
                            <AdaptationCard key={a.id || i} adaptation={a} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
