import { useContext } from 'react';
import { CampaignContext } from '../../context/CampaignContext';
import BudgetSlider from '../common/BudgetSlider';
import { BUDGET } from '../../utils/constants';

export default function StepBudgetGoals() {
    const { draft, updateDraft } = useContext(CampaignContext);

    return (
        <div className="page-enter">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Budget & Campaign Goals</h2>

            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <BudgetSlider
                    steps={BUDGET.STEPS}
                    value={draft.budget}
                    onChange={(value) => updateDraft({ budget: value })}
                />
            </div>

            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label htmlFor="campaign-name">Campaign Name</label>
                <input
                    id="campaign-name"
                    type="text"
                    placeholder="e.g., Summer Fitness Launch"
                    value={draft.campaignName}
                    onChange={(e) => updateDraft({ campaignName: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="campaign-goals">Campaign Goals</label>
                <textarea
                    id="campaign-goals"
                    rows={4}
                    placeholder="Describe your campaign objectives..."
                    value={draft.goals}
                    onChange={(e) => updateDraft({ goals: e.target.value })}
                    style={{ resize: 'vertical' }}
                />
            </div>
        </div>
    );
}
