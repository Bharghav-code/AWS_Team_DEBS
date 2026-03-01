import { Cloud } from 'lucide-react';

export default function Header() {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-xs) var(--space-md)',
            background: 'var(--color-light-gray)',
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-secondary)',
        }}>
            <Cloud size={14} />
            <span>Powered by AWS — Serverless Architecture</span>
        </header>
    );
}
