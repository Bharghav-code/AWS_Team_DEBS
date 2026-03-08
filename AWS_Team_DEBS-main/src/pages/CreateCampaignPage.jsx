import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from 'lucide-react';
import { CampaignContext } from '../context/CampaignContext';
import { useCreateCampaign } from '../hooks/useCampaigns';
import WizardStepper from '../components/wizard/WizardStepper';
import StepBudgetGoals from '../components/wizard/StepBudgetGoals';
import StepTargetMarket from '../components/wizard/StepTargetMarket';
import StepContent from '../components/wizard/StepContent';
import StepInfluencers from '../components/wizard/StepInfluencers';
import StepReview from '../components/wizard/StepReview';
import { ROUTES } from '../utils/constants';

const steps = {
    1: StepBudgetGoals,
    2: StepTargetMarket,
    3: StepContent,
    4: StepInfluencers,
    5: StepReview,
};

export default function CreateCampaignPage() {
    const { draft, nextStep, prevStep, resetDraft, saveDraft } = useContext(CampaignContext);
    const createMutation = useCreateCampaign();
    const navigate = useNavigate();

    const StepComponent = steps[draft.step];

    const handleLaunch = () => {
        createMutation.mutate({ ...draft, status: 'active' }, {
            onSuccess: () => {
                resetDraft();
                navigate(ROUTES.DASHBOARD);
            },
        });
    };

    return (
        <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <h1 style={{ marginBottom: 'var(--space-lg)' }}>Create Campaign</h1>

            <WizardStepper currentStep={draft.step} />

            <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <StepComponent />
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--space-md)',
            }}>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { saveDraft(); prevStep(); }}
                    disabled={draft.step === 1}
                    style={{
                        opacity: draft.step === 1 ? 0.5 : 1,
                        border: '1px solid var(--color-border-medium)',
                        background: 'var(--color-white)',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                {draft.step < 5 ? (
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => { saveDraft(); nextStep(); }}
                        style={{ background: 'var(--color-coffee)', color: 'var(--color-brass)' }}
                    >
                        Next <ArrowRight size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleLaunch}
                        disabled={createMutation.isPending}
                        style={{ background: 'var(--color-coffee)', color: 'var(--color-brass)' }}
                    >
                        {createMutation.isPending ? (
                            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Launching...</>
                        ) : (
                            <><Rocket size={18} /> Launch Campaign</>
                        )}
                    </button>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
