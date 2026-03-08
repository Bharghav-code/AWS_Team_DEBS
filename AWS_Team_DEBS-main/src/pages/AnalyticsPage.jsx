import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import Chart from '../components/common/Chart';
import { MetricSkeleton } from '../components/common/LoadingSkeleton';
import { formatNumber, formatPercentage, formatCurrency } from '../utils/formatters';
import { exportAnalytics } from '../services/analyticsService';

const sampleData = [
    { name: 'Jan', reach: 45000, engagement: 3200, conversions: 120 },
    { name: 'Feb', reach: 52000, engagement: 3800, conversions: 145 },
    { name: 'Mar', reach: 61000, engagement: 4500, conversions: 180 },
    { name: 'Apr', reach: 78000, engagement: 5200, conversions: 210 },
    { name: 'May', reach: 95000, engagement: 6100, conversions: 260 },
    { name: 'Jun', reach: 125000, engagement: 8200, conversions: 340 },
];


export default function AnalyticsPage() {
    const [period, setPeriod] = useState('6months');
    const { data, isLoading } = useAnalytics({ period });
    const analyticsData = data || {};

    const metrics = [
        { label: 'Total Reach', value: formatNumber(analyticsData.totalReach || 456000) },
        { label: 'Avg Engagement', value: formatPercentage(analyticsData.avgEngagement || 8.2) },
        { label: 'Conversions', value: formatNumber(analyticsData.conversions || 1255) },
        { label: 'ROI', value: formatPercentage(analyticsData.roi || 340) },
    ];

    const handleExport = async () => {
        try {
            await exportAnalytics({ period });
        } catch {
            // Silently handle
        }
    };

    return (
        <div className="page-enter" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h1>Analytics</h1>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '160px' }}>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                    </select>
                    <button className="btn-secondary" onClick={handleExport} style={{
                        border: '1px solid var(--color-border-medium)',
                        background: 'var(--color-white)',
                        color: 'var(--color-text-primary)',
                    }}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => <MetricSkeleton key={i} />)
                ) : (
                    metrics.map((m) => (
                        <div key={m.label} className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                            <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>{m.label}</div>
                            <div style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.value}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Performance Chart */}
            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ marginBottom: 'var(--space-md)' }}>Performance Overview</h2>
                <Chart type="area" data={analyticsData.timeline || sampleData} dataKeys={['reach', 'engagement', 'conversions']} height={350} />
            </div>
        </div>
    );
}
