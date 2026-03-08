import { Check } from 'lucide-react';
import { WIZARD_STEPS } from '../../utils/constants';

export default function WizardStepper({ currentStep }) {
    return (
        <>
            {/* Desktop stepper */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0',
                marginBottom: 'var(--space-xl)',
            }} className="wizard-desktop" role="navigation" aria-label="Wizard progress">
                {WIZARD_STEPS.map((step, i) => {
                    const isDone = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    return (
                        <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                id={`wizard-step-${step.number}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 'var(--space-xs)',
                                    minWidth: '100px',
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    background: isDone ? 'var(--color-success)' :
                                        isCurrent ? 'var(--color-professional-blue)' : 'var(--color-light-gray)',
                                    color: isDone || isCurrent ? 'var(--color-chinese-black)' : 'var(--color-text-muted)',
                                    transition: 'all var(--transition-base)',
                                }}
                                    aria-current={isCurrent ? 'step' : undefined}
                                >
                                    {isDone ? <Check size={16} /> : step.number}
                                </div>
                                <span style={{
                                    fontSize: 'var(--font-size-caption)',
                                    fontWeight: isCurrent ? 600 : 400,
                                    color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                }}>
                                    {step.label}
                                </span>
                            </div>
                            {i < WIZARD_STEPS.length - 1 && (
                                <div style={{
                                    width: '40px',
                                    height: '2px',
                                    background: isDone ? 'var(--color-success)' : 'var(--color-border-light)',
                                    margin: '0 var(--space-xs)',
                                    marginBottom: '20px',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile stepper */}
            <div className="wizard-mobile" style={{ display: 'none', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                    <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>
                        Step {currentStep} of 5
                    </span>
                    <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>
                        {Math.round((currentStep / 5) * 100)}%
                    </span>
                </div>
                <div style={{
                    height: '6px',
                    background: 'var(--color-light-gray)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${(currentStep / 5) * 100}%`,
                        background: 'var(--color-professional-blue)',
                        borderRadius: '3px',
                        transition: 'width var(--transition-slow)',
                    }} />
                </div>
                <p style={{
                    fontSize: 'var(--font-size-label)',
                    fontWeight: 600,
                    marginTop: 'var(--space-xs)',
                    marginBottom: 0,
                    color: 'var(--color-text-primary)',
                }}>
                    {WIZARD_STEPS.find((s) => s.number === currentStep)?.label}
                </p>
            </div>

            <style>{`
        @media (max-width: 767px) {
          .wizard-desktop { display: none !important; }
          .wizard-mobile { display: block !important; }
        }
      `}</style>
        </>
    );
}
