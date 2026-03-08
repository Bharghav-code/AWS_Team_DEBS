export default function LoadingSkeleton({ lines = 3, height = 20, width = '100%' }) {
    return (
        <div role="status" aria-label="Loading">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton"
                    style={{
                        height: `${height}px`,
                        width: i === lines - 1 ? '60%' : width,
                        marginBottom: 'var(--space-sm)',
                        borderRadius: 'var(--radius-md)',
                    }}
                />
            ))}
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card" style={{ minHeight: '200px' }}>
            <div className="skeleton" style={{ height: '14px', width: '80px', marginBottom: 'var(--space-sm)' }} />
            <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: 'var(--space-md)' }} />
            <div className="skeleton" style={{ height: '8px', width: '100%', marginBottom: 'var(--space-xs)' }} />
            <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: 'var(--space-md)' }} />
            <div className="skeleton" style={{ height: '14px', width: '60%' }} />
        </div>
    );
}

export function MetricSkeleton() {
    return (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
            <div className="skeleton" style={{ height: '12px', width: '60%', margin: '0 auto var(--space-sm)' }} />
            <div className="skeleton" style={{ height: '28px', width: '40%', margin: '0 auto' }} />
        </div>
    );
}
