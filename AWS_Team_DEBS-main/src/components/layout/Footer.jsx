import { Cloud } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            textAlign: 'center',
            padding: 'var(--space-lg) var(--space-md)',
            borderTop: '1px solid var(--color-border-light)',
            background: 'var(--color-white)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-caption)',
            marginTop: 'auto',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}>
                <Cloud size={16} />
                <span>Powered by AWS</span>
            </div>
            <p style={{ marginTop: 'var(--space-sm)', marginBottom: 0 }}>
                © {new Date().getFullYear()} Virale — AI-Powered Viral Marketing Platform
            </p>
        </footer>
    );
}
