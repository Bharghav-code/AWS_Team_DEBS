import React, { useCallback, useMemo } from 'react';
import styles from '../../styles/components/BudgetSlider.module.css';

/**
 * Format a rupee value to compact label: ₹5K, ₹20K, ₹1L etc.
 */
function formatBudgetLabel(value) {
    if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return `₹${value}`;
}

const BudgetSlider = React.memo(function BudgetSlider({
    steps = [5000, 20000, 35000, 50000, 65000, 80000, 95000, 100000],
    value,
    onChange,
}) {
    // Find the closest step index for the current value
    const currentIndex = useMemo(() => {
        let closest = 0;
        let minDist = Math.abs(steps[0] - value);
        for (let i = 1; i < steps.length; i++) {
            const dist = Math.abs(steps[i] - value);
            if (dist < minDist) {
                minDist = dist;
                closest = i;
            }
        }
        return closest;
    }, [steps, value]);

    const percentage = (currentIndex / (steps.length - 1)) * 100;

    const handleChange = useCallback((e) => {
        const idx = Number(e.target.value);
        onChange(steps[idx]);
    }, [steps, onChange]);

    return (
        <div className={styles.sliderContainer} id="budget-slider">
            <div className={styles.sliderLabel}>
                <label htmlFor="budget-input">Selected Budget</label>
                <span className={styles.selectedValue}>{formatBudgetLabel(value)}</span>
            </div>

            <div className={styles.sliderTrack}>
                <div className={styles.sliderFill} style={{ width: `${percentage}%` }} />
                <input
                    id="budget-input"
                    type="range"
                    className={styles.sliderInput}
                    min={0}
                    max={steps.length - 1}
                    step={1}
                    value={currentIndex}
                    onChange={handleChange}
                    aria-label={`Budget: ${formatBudgetLabel(value)}`}
                    aria-valuemin={steps[0]}
                    aria-valuemax={steps[steps.length - 1]}
                    aria-valuenow={value}
                />
            </div>

            <div className={styles.ticks}>
                {steps.map((tick, i) => (
                    <span
                        key={tick}
                        className={`${styles.tick} ${i === currentIndex ? styles.tickActive : ''}`}
                        onClick={() => onChange(tick)}
                        role="button"
                        tabIndex={-1}
                    >
                        {formatBudgetLabel(tick)}
                    </span>
                ))}
            </div>
        </div>
    );
});

export default BudgetSlider;
