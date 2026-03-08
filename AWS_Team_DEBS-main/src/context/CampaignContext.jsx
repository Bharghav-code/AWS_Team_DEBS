import { createContext, useState, useCallback } from 'react';

const initialDraft = {
    step: 1,
    budget: 25000,
    goals: '',
    market: '',
    category: '',
    content: '',
    selectedInfluencers: [],
    campaignName: '',
};

export const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
    const [draft, setDraft] = useState(initialDraft);

    const updateDraft = useCallback((updates) => {
        setDraft((prev) => ({ ...prev, ...updates }));
    }, []);

    const nextStep = useCallback(() => {
        setDraft((prev) => ({ ...prev, step: Math.min(prev.step + 1, 5) }));
    }, []);

    const prevStep = useCallback(() => {
        setDraft((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    }, []);

    const goToStep = useCallback((step) => {
        setDraft((prev) => ({ ...prev, step }));
    }, []);

    const saveDraft = useCallback(() => {
        try {
            localStorage.setItem('virale_campaign_draft', JSON.stringify(draft));
        } catch {
            // Ignore storage errors
        }
    }, [draft]);

    const loadDraft = useCallback(() => {
        try {
            const saved = localStorage.getItem('virale_campaign_draft');
            if (saved) {
                setDraft(JSON.parse(saved));
            }
        } catch {
            // Ignore
        }
    }, []);

    const resetDraft = useCallback(() => {
        setDraft(initialDraft);
        localStorage.removeItem('virale_campaign_draft');
    }, []);

    const value = {
        draft,
        updateDraft,
        nextStep,
        prevStep,
        goToStep,
        saveDraft,
        loadDraft,
        resetDraft,
    };

    return (
        <CampaignContext.Provider value={value}>
            {children}
        </CampaignContext.Provider>
    );
}
