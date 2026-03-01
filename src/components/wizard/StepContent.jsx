import { useContext, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { CampaignContext } from '../../context/CampaignContext';
import { useContentAdaptation } from '../../hooks/useContentAdaptation';

export default function StepContent() {
    const { draft, updateDraft } = useContext(CampaignContext);
    const contentMutation = useContentAdaptation();
    const [adapted, setAdapted] = useState(null);

    const handleAdapt = () => {
        contentMutation.mutate(
            {
                content: draft.content,
                market: draft.market,
                category: draft.category,
            },
            {
                onSuccess: (data) => {
                    setAdapted(data);
                },
            }
        );
    };

    return (
        <div className="page-enter">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Content Creation</h2>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label htmlFor="content-input">Campaign Content</label>
                <textarea
                    id="content-input"
                    rows={6}
                    placeholder="Write your campaign message, caption, or ad copy..."
                    value={draft.content}
                    onChange={(e) => updateDraft({ content: e.target.value })}
                    style={{ resize: 'vertical' }}
                />
            </div>

            <button
                type="button"
                className="btn-primary"
                onClick={handleAdapt}
                disabled={!draft.content || contentMutation.isPending}
                style={{ marginBottom: 'var(--space-lg)', opacity: !draft.content ? 0.5 : 1 }}
            >
                {contentMutation.isPending ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Adapting...</>
                ) : (
                    <><Sparkles size={18} /> AI Adapt for {draft.market || 'Market'}</>
                )}
            </button>

            {adapted && (
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Sparkles size={18} style={{ color: 'var(--color-professional-blue)' }} />
                        AI-Adapted Content
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {adapted.adaptedContent || adapted.content || 'Content adapted for your target market.'}
                    </p>
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
