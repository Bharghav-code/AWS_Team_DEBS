import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Sparkles, Zap, Globe, User, Image } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { MOCK_INFLUENCERS, MOCK_TRENDS } from '../data/mockData';
import CardCarousel from '../components/common/CardCarousel';
import { formatNumber, formatPercentage } from '../utils/formatters';

const features = [
    {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'AI-powered trend detection across emerging markets with real-time alignment scoring.',
    },
    {
        icon: Users,
        title: 'Influencer Matching',
        description: 'Find the perfect influencers for your brand within budget, powered by smart algorithms.',
    },
    {
        icon: Sparkles,
        title: 'AI Content Adaptation',
        description: 'Automatically adapt your content for local markets using Amazon Bedrock AI.',
    },
];

const stats = [
    { value: '10K+', label: 'Campaigns' },
    { value: '500+', label: 'Influencers' },
    { value: '50+', label: 'Markets' },
];

/* ─── Mini card renderers for the carousel ─── */

function renderInfluencerMini(inf, _i, isActive) {
    return (
        <div className="card" style={{
            padding: 'var(--space-lg)',
            textAlign: 'center',
            minHeight: '260px',
            opacity: isActive ? 1 : 0.85,
            transition: 'opacity 0.3s ease',
        }}>
            {/* Placeholder Image */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(207, 157, 123, 0.08)',
                border: '2px dashed var(--color-border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-md)',
                color: 'var(--color-text-muted)',
            }}>
                {inf.imageUrl ? (
                    <img src={inf.imageUrl} alt={inf.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    <User size={28} />
                )}
            </div>

            <h3 style={{ fontSize: 'var(--font-size-h3)', marginBottom: '2px' }}>{inf.name}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-caption)', marginBottom: 'var(--space-sm)' }}>
                {inf.handle}
            </p>
            <span style={{
                display: 'inline-block',
                padding: '2px var(--space-sm)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                background: 'var(--color-jet)',
                color: 'var(--color-brass)',
                marginBottom: 'var(--space-sm)',
            }}>
                {inf.category}
            </span>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-lg)',
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-text-secondary)',
            }}>
                <span><strong style={{ color: 'var(--color-text-primary)' }}>{formatNumber(inf.followers)}</strong> followers</span>
                <span><strong style={{ color: 'var(--color-text-primary)' }}>{formatPercentage(inf.engagementRate)}</strong> eng.</span>
            </div>
        </div>
    );
}

function renderTrendMini(trend, _i, isActive) {
    return (
        <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            minHeight: '240px',
            opacity: isActive ? 1 : 0.85,
            transition: 'opacity 0.3s ease',
        }}>
            {/* Placeholder Image */}
            <div style={{
                width: '100%',
                height: '100px',
                background: 'rgba(207, 157, 123, 0.06)',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
            }}>
                {trend.imageUrl ? (
                    <img src={trend.imageUrl} alt={trend.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <Image size={24} />
                )}
            </div>

            <div style={{ padding: 'var(--space-md)' }}>
                <span style={{
                    display: 'inline-block',
                    padding: '2px var(--space-sm)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: 'var(--color-jet)',
                    color: 'var(--color-brass)',
                    marginBottom: 'var(--space-sm)',
                }}>
                    {trend.badge}
                </span>
                <h3 style={{ fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-xs)' }}>{trend.name}</h3>

                {/* Alignment bar */}
                <div style={{
                    height: '6px',
                    background: 'var(--color-light-gray)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${trend.alignmentPercentage}%`,
                        background: 'var(--color-brass)',
                        borderRadius: '3px',
                    }} />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--color-text-secondary)',
                }}>
                    <span>Brand Alignment</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{trend.alignmentPercentage}%</strong>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="page-enter">
            {/* Hero Section */}
            <section style={{
                background: 'var(--gradient-hero)',
                color: 'var(--color-white)',
                padding: 'var(--space-3xl) var(--space-xl)',
                textAlign: 'center',
            }}>
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 48px)',
                        fontWeight: 700,
                        marginBottom: 'var(--space-md)',
                        color: '#CF9D7B',
                        lineHeight: 1.15,
                    }}>
                        Go Viral with Bharat Brands
                    </h1>
                    <p style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        opacity: 0.9,
                        marginBottom: 'var(--space-xl)',
                        lineHeight: 1.6,
                    }}>
                        Connect with trending opportunities across emerging markets. AI-powered campaign creation, influencer matching, and content adaptation.
                    </p>
                    <Link
                        to={ROUTES.REGISTER}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            padding: '14px 32px',
                            background: '#CF9D7B',
                            color: 'var(--color-deep-blue)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            fontSize: '16px',
                            textDecoration: 'none',
                            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                        }}
                        id="btn-get-started"
                    >
                        Get Started <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                padding: 'var(--space-3xl) var(--space-xl)',
                maxWidth: 'var(--max-width)',
                margin: '0 auto',
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                    Everything you need to go viral
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--space-lg)',
                }}>
                    {features.map((feat) => (
                        <div key={feat.title} className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: 'var(--radius-xl)',
                                background: 'var(--color-jet)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto var(--space-md)',
                                color: 'var(--color-professional-blue)',
                            }}>
                                <feat.icon size={28} />
                            </div>
                            <h3 style={{ marginBottom: 'var(--space-sm)' }}>{feat.title}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>{feat.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Featured Influencers Carousel ── */}
            <section style={{
                padding: 'var(--space-2xl) var(--space-xl)',
                maxWidth: 'var(--max-width)',
                margin: '0 auto',
            }}>
                <CardCarousel
                    items={MOCK_INFLUENCERS}
                    renderCard={renderInfluencerMini}
                    title="Featured Influencers"
                    autoAdvanceMs={4000}
                />
            </section>

            {/* Social Proof */}
            <section style={{
                padding: 'var(--space-2xl) var(--space-xl)',
                background: 'var(--color-light-gray)',
            }}>
                <div style={{
                    maxWidth: 'var(--max-width)',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-3xl)',
                    flexWrap: 'wrap',
                }}>
                    {stats.map((stat) => (
                        <div key={stat.label} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: 'clamp(28px, 4vw, 40px)',
                                fontWeight: 700,
                                color: 'var(--color-deep-blue)',
                            }}>
                                {stat.value}
                            </div>
                            <div style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Trending Now Carousel ── */}
            <section style={{
                padding: 'var(--space-2xl) var(--space-xl)',
                maxWidth: 'var(--max-width)',
                margin: '0 auto',
            }}>
                <CardCarousel
                    items={MOCK_TRENDS}
                    renderCard={renderTrendMini}
                    title="Trending Now"
                    autoAdvanceMs={5000}
                />
            </section>

            {/* CTA Section */}
            <section style={{
                padding: 'var(--space-3xl) var(--space-xl)',
                textAlign: 'center',
            }}>
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <Globe size={48} style={{ color: 'var(--color-accent-teal)', marginBottom: 'var(--space-md)' }} />
                    <h2 style={{ marginBottom: 'var(--space-md)' }}>Ready to go viral?</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        Join thousands of brands already using Virale to create impactful campaigns.
                    </p>
                    <Link to={ROUTES.REGISTER} className="btn-primary" style={{
                        display: 'inline-flex',
                        padding: '14px 32px',
                        textDecoration: 'none',
                        background: 'var(--color-coffee)',
                        color: 'var(--color-brass)',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                    }}>
                        <Zap size={18} /> Start Free Trial
                    </Link>
                </div>
            </section>
        </div>
    );
}
